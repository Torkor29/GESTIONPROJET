"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { taches } from "@/db/schema";
import { estConnecte, exigerSession } from "@/lib/auth";
import { depuisChampDate } from "@/lib/format";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

export async function creerTache(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    if (!(await estConnecte())) return { erreur: "Session expirée. Reconnectez-vous." };

    const titre = String(donnees.get("titre") ?? "").trim();
    if (!titre) return { erreur: "Le titre de la tâche est obligatoire." };

    const etudeIdBrut = donnees.get("etudeId");

    await db.insert(taches).values({
      etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
      titre,
      notes: String(donnees.get("notes") ?? "").trim() || null,
      priorite: String(donnees.get("priorite") ?? "normale"),
      echeance: depuisChampDate(String(donnees.get("echeance") ?? "")),
    });

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function modifierTache(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    if (!(await estConnecte())) return { erreur: "Session expirée. Reconnectez-vous." };

    const id = Number(donnees.get("id"));
    const titre = String(donnees.get("titre") ?? "").trim();
    if (!id) return { erreur: "Tâche introuvable." };
    if (!titre) return { erreur: "Le titre de la tâche est obligatoire." };

    const statut = String(donnees.get("statut") ?? "a_faire");
    const etudeIdBrut = donnees.get("etudeId");

    await db
      .update(taches)
      .set({
        etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
        titre,
        notes: String(donnees.get("notes") ?? "").trim() || null,
        statut,
        priorite: String(donnees.get("priorite") ?? "normale"),
        echeance: depuisChampDate(String(donnees.get("echeance") ?? "")),
        termineeLe: statut === "terminee" ? maintenant() : null,
        modifieLe: maintenant(),
      })
      .where(eq(taches.id, id));

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

/** Coche / décoche une tâche depuis la liste. */
export async function basculerTache(donnees: FormData) {
  await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Tâche manquante.");

  const [tache] = await db
    .select({ statut: taches.statut })
    .from(taches)
    .where(eq(taches.id, id))
    .limit(1);
  if (!tache) throw new Error("Tâche introuvable.");

  const terminee = tache.statut === "terminee";
  await db
    .update(taches)
    .set({
      statut: terminee ? "a_faire" : "terminee",
      termineeLe: terminee ? null : maintenant(),
      modifieLe: maintenant(),
    })
    .where(eq(taches.id, id));

  revalidatePath("/", "layout");
}

/**
 * Change uniquement le statut, depuis le sélecteur en ligne du tableau.
 *
 * Prend des arguments simples plutôt qu'un FormData : React 19 réinitialise
 * automatiquement un formulaire après l'exécution de son action, ce qui
 * ramenait visuellement le sélecteur à son ancienne valeur alors que
 * l'enregistrement avait bien eu lieu.
 */
export async function definirStatutTache(id: number, statut: string) {
  await exigerSession();

  if (!id || !["a_faire", "en_cours", "terminee"].includes(statut)) {
    throw new Error("Statut de mission invalide.");
  }

  await db
    .update(taches)
    .set({
      statut,
      termineeLe: statut === "terminee" ? maintenant() : null,
      modifieLe: maintenant(),
    })
    .where(eq(taches.id, id));

  revalidatePath("/", "layout");
}

export async function supprimerTache(donnees: FormData) {
  await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Tâche manquante.");

  await db.delete(taches).where(eq(taches.id, id));
  revalidatePath("/", "layout");
}
