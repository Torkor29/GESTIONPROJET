"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { actionsCorrectives, ecarts } from "@/db/schema";
import { objetAccessible } from "@/lib/acces";
import { exigerSession, utilisateurActuel } from "@/lib/auth";
import {
  CATEGORIES_ECART,
  GRAVITES_ECART,
  NATURES_ACTION,
  STATUTS_ACTION,
  STATUTS_ECART,
} from "@/lib/constantes";
import { depuisChampDate } from "@/lib/format";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

async function exigerAccesEcart(id: number, utilisateurId: number): Promise<void> {
  const [ligne] = await db
    .select({ id: ecarts.id })
    .from(ecarts)
    .where(
      and(eq(ecarts.id, id), objetAccessible(ecarts.proprietaireId, ecarts.etudeId, utilisateurId)),
    )
    .limit(1);
  if (!ligne) throw new Error("Vous n'avez pas accès à cet écart.");
}

async function exigerAccesAction(id: number, utilisateurId: number): Promise<void> {
  const [ligne] = await db
    .select({ id: actionsCorrectives.id })
    .from(actionsCorrectives)
    .where(
      and(
        eq(actionsCorrectives.id, id),
        objetAccessible(
          actionsCorrectives.proprietaireId,
          actionsCorrectives.etudeId,
          utilisateurId,
        ),
      ),
    )
    .limit(1);
  if (!ligne) throw new Error("Vous n'avez pas accès à cette action.");
}

/* -------------------------------------------------------------------------- */
/*  Écarts                                                                    */
/* -------------------------------------------------------------------------- */

function lireEcart(donnees: FormData) {
  const titre = String(donnees.get("titre") ?? "").trim();
  if (!titre) return { erreur: "Décrivez l'écart en une ligne." as const };

  const categorie = String(donnees.get("categorie") ?? "protocole");
  const gravite = String(donnees.get("gravite") ?? "mineur");
  const statut = String(donnees.get("statut") ?? "ouvert");

  if (!(categorie in CATEGORIES_ECART)) return { erreur: "Catégorie inconnue." as const };
  if (!(gravite in GRAVITES_ECART)) return { erreur: "Gravité inconnue." as const };
  if (!(statut in STATUTS_ECART)) return { erreur: "Statut inconnu." as const };

  const etudeIdBrut = donnees.get("etudeId");
  const visiteIdBrut = donnees.get("visiteId");

  return {
    valeurs: {
      etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
      visiteId: visiteIdBrut ? Number(visiteIdBrut) : null,
      reference: String(donnees.get("reference") ?? "").trim() || null,
      titre,
      description: String(donnees.get("description") ?? "").trim() || null,
      centre: String(donnees.get("centre") ?? "").trim() || null,
      categorie,
      gravite,
      statut,
      dateConstat: depuisChampDate(String(donnees.get("dateConstat") ?? "")),
      // Clore un écart l'horodate : sans date de clôture, impossible de mesurer
      // le délai de traitement à la lecture du registre.
      dateCloture:
        statut === "clos"
          ? (depuisChampDate(String(donnees.get("dateCloture") ?? "")) ?? maintenant())
          : null,
    },
  };
}

export async function creerEcart(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const lu = lireEcart(donnees);
    if (lu.erreur) return { erreur: lu.erreur };

    await db.insert(ecarts).values({ ...lu.valeurs, proprietaireId: compte.id });

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function modifierEcart(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const id = Number(donnees.get("id"));
    if (!id) return { erreur: "Écart introuvable." };
    await exigerAccesEcart(id, compte.id);

    const lu = lireEcart(donnees);
    if (lu.erreur) return { erreur: lu.erreur };

    await db
      .update(ecarts)
      .set({ ...lu.valeurs, modifieLe: maintenant() })
      .where(eq(ecarts.id, id));

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function definirStatutEcart(id: number, statut: string): Promise<void> {
  const compte = await exigerSession();
  if (!id || !(statut in STATUTS_ECART)) throw new Error("Statut d'écart invalide.");
  await exigerAccesEcart(id, compte.id);

  await db
    .update(ecarts)
    .set({
      statut,
      dateCloture: statut === "clos" ? maintenant() : null,
      modifieLe: maintenant(),
    })
    .where(eq(ecarts.id, id));

  revalidatePath("/", "layout");
}

export async function supprimerEcart(donnees: FormData): Promise<void> {
  const compte = await exigerSession();
  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Écart manquant.");
  await exigerAccesEcart(id, compte.id);

  // Les actions rattachées partent avec l'écart : la cascade du schéma s'en
  // charge, mais on le dit ici parce que ce n'est pas anodin.
  await db.delete(ecarts).where(eq(ecarts.id, id));
  revalidatePath("/", "layout");
}

/* -------------------------------------------------------------------------- */
/*  Actions correctives                                                       */
/* -------------------------------------------------------------------------- */

function lireAction(donnees: FormData) {
  const titre = String(donnees.get("titre") ?? "").trim();
  if (!titre) return { erreur: "Décrivez l'action en une ligne." as const };

  const nature = String(donnees.get("nature") ?? "corrective");
  const statut = String(donnees.get("statut") ?? "a_faire");

  if (!(nature in NATURES_ACTION)) return { erreur: "Nature d'action inconnue." as const };
  if (!(statut in STATUTS_ACTION)) return { erreur: "Statut d'action inconnu." as const };

  const etudeIdBrut = donnees.get("etudeId");
  const ecartIdBrut = donnees.get("ecartId");

  return {
    valeurs: {
      etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
      ecartId: ecartIdBrut ? Number(ecartIdBrut) : null,
      nature,
      titre,
      description: String(donnees.get("description") ?? "").trim() || null,
      responsable: String(donnees.get("responsable") ?? "").trim() || null,
      echeance: depuisChampDate(String(donnees.get("echeance") ?? "")),
      statut,
      efficacite: String(donnees.get("efficacite") ?? "").trim() || null,
      // Une action n'est close qu'une fois vérifiée ou abandonnée : « faite »
      // ne suffit pas, on doit avoir constaté son effet.
      dateCloture: statut === "verifiee" || statut === "abandonnee" ? maintenant() : null,
    },
  };
}

export async function creerAction(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const lu = lireAction(donnees);
    if (lu.erreur) return { erreur: lu.erreur };

    // Rattacher une action à un écart auquel on n'a pas accès reviendrait à
    // deviner des identifiants pour se greffer sur le dossier d'un autre.
    if (lu.valeurs.ecartId) await exigerAccesEcart(lu.valeurs.ecartId, compte.id);

    await db.insert(actionsCorrectives).values({ ...lu.valeurs, proprietaireId: compte.id });

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function modifierAction(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const id = Number(donnees.get("id"));
    if (!id) return { erreur: "Action introuvable." };
    await exigerAccesAction(id, compte.id);

    const lu = lireAction(donnees);
    if (lu.erreur) return { erreur: lu.erreur };
    if (lu.valeurs.ecartId) await exigerAccesEcart(lu.valeurs.ecartId, compte.id);

    await db
      .update(actionsCorrectives)
      .set({ ...lu.valeurs, modifieLe: maintenant() })
      .where(eq(actionsCorrectives.id, id));

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function definirStatutAction(id: number, statut: string): Promise<void> {
  const compte = await exigerSession();
  if (!id || !(statut in STATUTS_ACTION)) throw new Error("Statut d'action invalide.");
  await exigerAccesAction(id, compte.id);

  await db
    .update(actionsCorrectives)
    .set({
      statut,
      dateCloture: statut === "verifiee" || statut === "abandonnee" ? maintenant() : null,
      modifieLe: maintenant(),
    })
    .where(eq(actionsCorrectives.id, id));

  revalidatePath("/", "layout");
}

export async function supprimerAction(donnees: FormData): Promise<void> {
  const compte = await exigerSession();
  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Action manquante.");
  await exigerAccesAction(id, compte.id);

  await db.delete(actionsCorrectives).where(eq(actionsCorrectives.id, id));
  revalidatePath("/", "layout");
}
