"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { visites } from "@/db/schema";
import { objetAccessible } from "@/lib/acces";
import { exigerSession, utilisateurActuel } from "@/lib/auth";
import { STATUTS_VISITE, TYPES_VISITE } from "@/lib/constantes";
import { depuisChampDate } from "@/lib/format";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

/**
 * Vérifie qu'une visite est accessible à la personne connectée.
 *
 * Écrit ici plutôt que d'utiliser le garde générique de `lib/acces` : celui-ci
 * connaît les tables existantes, et l'y ajouter obligerait à modifier une
 * fonction partagée à chaque nouveau module.
 */
async function exigerAccesVisite(id: number, utilisateurId: number): Promise<void> {
  const [ligne] = await db
    .select({ id: visites.id })
    .from(visites)
    .where(
      and(
        eq(visites.id, id),
        objetAccessible(visites.proprietaireId, visites.etudeId, utilisateurId),
      ),
    )
    .limit(1);
  if (!ligne) throw new Error("Vous n'avez pas accès à cette visite.");
}

/** Lit et valide les champs communs à la création et à la modification. */
function lireChamps(donnees: FormData) {
  const type = String(donnees.get("type") ?? "routine");
  const statut = String(donnees.get("statut") ?? "planifiee");

  if (!(type in TYPES_VISITE)) return { erreur: "Type de visite inconnu." as const };
  if (!(statut in STATUTS_VISITE)) return { erreur: "Statut de visite inconnu." as const };

  const datePrevue = depuisChampDate(String(donnees.get("datePrevue") ?? ""));
  const dateRealisee = depuisChampDate(String(donnees.get("dateRealisee") ?? ""));

  // Une visite réalisée avant d'être prévue trahit une saisie inversée : mieux
  // vaut le dire tout de suite que laisser un planning incohérent.
  if (datePrevue && dateRealisee && dateRealisee < datePrevue - 365 * 86400) {
    return { erreur: "La date de réalisation précède de plus d'un an la date prévue." as const };
  }

  const etudeIdBrut = donnees.get("etudeId");

  return {
    valeurs: {
      etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
      type,
      statut,
      centre: String(donnees.get("centre") ?? "").trim() || null,
      monitorNom: String(donnees.get("monitorNom") ?? "").trim() || null,
      datePrevue,
      dateRealisee,
      lettreEnvoyeeLe: depuisChampDate(String(donnees.get("lettreEnvoyeeLe") ?? "")),
      notes: String(donnees.get("notes") ?? "").trim() || null,
    },
  };
}

export async function creerVisite(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const lu = lireChamps(donnees);
    if (lu.erreur) return { erreur: lu.erreur };

    await db.insert(visites).values({ ...lu.valeurs, proprietaireId: compte.id });

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function modifierVisite(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const id = Number(donnees.get("id"));
    if (!id) return { erreur: "Visite introuvable." };
    await exigerAccesVisite(id, compte.id);

    const lu = lireChamps(donnees);
    if (lu.erreur) return { erreur: lu.erreur };

    await db
      .update(visites)
      .set({ ...lu.valeurs, modifieLe: maintenant() })
      .where(eq(visites.id, id));

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

/**
 * Fait avancer une visite d'une étape. Sert au sélecteur de la liste, sans
 * passer par le formulaire complet.
 */
export async function definirStatutVisite(id: number, statut: string): Promise<void> {
  const compte = await exigerSession();
  if (!id || !(statut in STATUTS_VISITE)) throw new Error("Statut de visite invalide.");
  await exigerAccesVisite(id, compte.id);

  // Passer une visite à « réalisée » sans date de réalisation laisserait un
  // trou dans le suivi : on l'horodate au jour même, modifiable ensuite.
  const [visite] = await db
    .select({ dateRealisee: visites.dateRealisee })
    .from(visites)
    .where(eq(visites.id, id))
    .limit(1);

  const dateRealisee =
    statut !== "planifiee" && statut !== "annulee" && !visite?.dateRealisee
      ? maintenant()
      : visite?.dateRealisee;

  await db
    .update(visites)
    .set({ statut, dateRealisee, modifieLe: maintenant() })
    .where(eq(visites.id, id));

  revalidatePath("/", "layout");
}

export async function supprimerVisite(donnees: FormData): Promise<void> {
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Visite manquante.");
  await exigerAccesVisite(id, compte.id);

  await db.delete(visites).where(eq(visites.id, id));
  revalidatePath("/", "layout");
}
