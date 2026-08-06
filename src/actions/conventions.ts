"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { conventions } from "@/db/schema";
import { objetAccessible } from "@/lib/acces";
import { exigerSession, utilisateurActuel } from "@/lib/auth";
import { STATUTS_CONVENTION, TYPES_CONVENTION } from "@/lib/constantes";
import { analyserMontant, depuisChampDate } from "@/lib/format";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

async function exigerAccesConvention(id: number, utilisateurId: number): Promise<void> {
  const [ligne] = await db
    .select({ id: conventions.id })
    .from(conventions)
    .where(
      and(
        eq(conventions.id, id),
        objetAccessible(conventions.proprietaireId, conventions.etudeId, utilisateurId),
      ),
    )
    .limit(1);
  if (!ligne) throw new Error("Vous n'avez pas accès à cette convention.");
}

function lireChamps(donnees: FormData) {
  const type = String(donnees.get("type") ?? "convention");
  const statut = String(donnees.get("statut") ?? "en_negociation");

  if (!(type in TYPES_CONVENTION)) return { erreur: "Type de contrat inconnu." as const };
  if (!(statut in STATUTS_CONVENTION)) return { erreur: "Statut inconnu." as const };

  const total = analyserMontant(String(donnees.get("montantTotal") ?? ""));
  if (total === undefined) {
    return { erreur: "Montant total illisible. Exemples : 12 500,50 ou 12500.5." as const };
  }

  const recu = analyserMontant(String(donnees.get("montantRecu") ?? ""));
  if (recu === undefined) {
    return { erreur: "Montant reçu illisible. Exemples : 4 000,00 ou 4000." as const };
  }

  const etudeIdBrut = donnees.get("etudeId");
  const parentIdBrut = donnees.get("parentId");

  return {
    valeurs: {
      etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
      parentId: parentIdBrut ? Number(parentIdBrut) : null,
      type,
      reference: String(donnees.get("reference") ?? "").trim() || null,
      partie: String(donnees.get("partie") ?? "").trim() || null,
      montantTotal: total,
      montantRecu: recu ?? 0,
      dateSignature: depuisChampDate(String(donnees.get("dateSignature") ?? "")),
      dateEcheance: depuisChampDate(String(donnees.get("dateEcheance") ?? "")),
      statut,
      notes: String(donnees.get("notes") ?? "").trim() || null,
    },
  };
}

export async function creerConvention(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const lu = lireChamps(donnees);
    if (lu.erreur) return { erreur: lu.erreur };

    // Rattacher un avenant à une convention qu'on ne peut pas voir reviendrait
    // à se greffer sur le dossier d'un autre en devinant un identifiant.
    if (lu.valeurs.parentId) await exigerAccesConvention(lu.valeurs.parentId, compte.id);

    await db.insert(conventions).values({ ...lu.valeurs, proprietaireId: compte.id });

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function modifierConvention(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const id = Number(donnees.get("id"));
    if (!id) return { erreur: "Convention introuvable." };
    await exigerAccesConvention(id, compte.id);

    const lu = lireChamps(donnees);
    if (lu.erreur) return { erreur: lu.erreur };

    // Un avenant ne peut pas être son propre parent : la boucle ferait
    // disparaître la ligne de l'arborescence.
    if (lu.valeurs.parentId === id) {
      return { erreur: "Un avenant ne peut pas se rattacher à lui-même." };
    }
    if (lu.valeurs.parentId) await exigerAccesConvention(lu.valeurs.parentId, compte.id);

    await db
      .update(conventions)
      .set({ ...lu.valeurs, modifieLe: maintenant() })
      .where(eq(conventions.id, id));

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function definirStatutConvention(id: number, statut: string): Promise<void> {
  const compte = await exigerSession();
  if (!id || !(statut in STATUTS_CONVENTION)) throw new Error("Statut de convention invalide.");
  await exigerAccesConvention(id, compte.id);

  await db
    .update(conventions)
    .set({ statut, modifieLe: maintenant() })
    .where(eq(conventions.id, id));

  revalidatePath("/", "layout");
}

export async function supprimerConvention(donnees: FormData): Promise<void> {
  const compte = await exigerSession();
  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Convention manquante.");
  await exigerAccesConvention(id, compte.id);

  // Les avenants rattachés perdent leur parent mais restent : les supprimer
  // ferait disparaître des montants déjà perçus.
  await db.update(conventions).set({ parentId: null }).where(eq(conventions.parentId, id));
  await db.delete(conventions).where(eq(conventions.id, id));
  revalidatePath("/", "layout");
}
