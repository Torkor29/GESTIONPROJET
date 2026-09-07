"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { sousTaches, taches } from "@/db/schema";
import { exigerAcces } from "@/lib/acces";
import { exigerSession, utilisateurActuel } from "@/lib/auth";
import { depuisChampDate } from "@/lib/format";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

export async function creerTache(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const titre = String(donnees.get("titre") ?? "").trim();
    if (!titre) return { erreur: "Le titre de la tâche est obligatoire." };

    const etudeIdBrut = donnees.get("etudeId");

    const [creee] = await db
      .insert(taches)
      .values({
        proprietaireId: compte.id,
        etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
        titre,
        notes: String(donnees.get("notes") ?? "").trim() || null,
        priorite: String(donnees.get("priorite") ?? "normale"),
        echeance: depuisChampDate(String(donnees.get("echeance") ?? "")),
      })
      .returning({ id: taches.id });

    const etapes = String(donnees.get("lignesSousTaches") ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (creee && etapes.length > 0) {
      await db.insert(sousTaches).values(
        etapes.map((titreEtape, i) => ({
          tacheId: creee.id,
          titre: titreEtape,
          ordre: i,
        })),
      );
    }

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
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const id = Number(donnees.get("id"));
    const titre = String(donnees.get("titre") ?? "").trim();
    if (!id) return { erreur: "Tâche introuvable." };
    await exigerAcces("taches", id, compte.id);
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
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Tâche manquante.");
  await exigerAcces("taches", id, compte.id);

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
  const compte = await exigerSession();

  if (!id || !["a_faire", "en_cours", "terminee"].includes(statut)) {
    throw new Error("Statut de mission invalide.");
  }
  await exigerAcces("taches", id, compte.id);

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
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Tâche manquante.");
  await exigerAcces("taches", id, compte.id);

  await db.delete(taches).where(eq(taches.id, id));
  revalidatePath("/", "layout");
}

/** Relit une sous-tâche et vérifie l'accès via la mission parente. */
async function sousTacheAccessible(id: number, utilisateurId: number) {
  const [ligne] = await db
    .select({
      id: sousTaches.id,
      tacheId: sousTaches.tacheId,
      faite: sousTaches.faite,
    })
    .from(sousTaches)
    .where(eq(sousTaches.id, id))
    .limit(1);
  if (!ligne) throw new Error("Étape introuvable.");
  await exigerAcces("taches", ligne.tacheId, utilisateurId);
  return ligne;
}

export async function ajouterSousTache(donnees: FormData) {
  const compte = await exigerSession();

  const tacheId = Number(donnees.get("tacheId"));
  const titre = String(donnees.get("titre") ?? "").trim();
  if (!tacheId) throw new Error("Mission manquante.");
  if (!titre) throw new Error("Le titre de l'étape est obligatoire.");
  await exigerAcces("taches", tacheId, compte.id);

  const [derniere] = await db
    .select({ ordre: sousTaches.ordre })
    .from(sousTaches)
    .where(eq(sousTaches.tacheId, tacheId))
    .orderBy(desc(sousTaches.ordre))
    .limit(1);

  await db.insert(sousTaches).values({
    tacheId,
    titre,
    ordre: (derniere?.ordre ?? -1) + 1,
  });
  revalidatePath("/", "layout");
}

export async function basculerSousTache(donnees: FormData) {
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Étape manquante.");
  const ligne = await sousTacheAccessible(id, compte.id);

  await db
    .update(sousTaches)
    .set({ faite: !ligne.faite })
    .where(eq(sousTaches.id, id));
  revalidatePath("/", "layout");
}

export async function supprimerSousTache(donnees: FormData) {
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Étape manquante.");
  await sousTacheAccessible(id, compte.id);

  await db.delete(sousTaches).where(eq(sousTaches.id, id));
  revalidatePath("/", "layout");
}
