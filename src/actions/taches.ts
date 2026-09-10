"use server";

import { desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { etudes, sousTaches, taches, tachesEtudes, utilisateurs } from "@/db/schema";
import { exigerAcces, exigerEcritureMission, exigerGestionMission } from "@/lib/acces";
import { exigerSession, utilisateurActuel } from "@/lib/auth";
import { depuisChampDate, statutDepuisEtapes } from "@/lib/format";
import { lireCouleur } from "@/lib/couleurs";
import { assurerPartageEtude } from "./partages";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

function lireEtudeIds(donnees: FormData): number[] {
  const bruts = [...donnees.getAll("etudeIds"), donnees.get("etudeId")]
    .map((v) => String(v ?? "").trim())
    .filter(Boolean);
  const ids = bruts.map(Number).filter((n) => Number.isInteger(n) && n > 0);
  return [...new Set(ids)];
}

async function exigerProprietaireDesEtudes(
  etudeIds: number[],
  compteId: number,
): Promise<{ erreur: string } | { etudes: typeof etudes.$inferSelect[] }> {
  if (etudeIds.length === 0) return { etudes: [] };
  const lignes = db.select().from(etudes).where(inArray(etudes.id, etudeIds)).all();
  if (lignes.length !== etudeIds.length) return { erreur: "Étude introuvable." };
  if (lignes.some((e) => e.proprietaireId !== compteId)) {
    return { erreur: "Seul le propriétaire peut rattacher une mission à ces études." };
  }
  return { etudes: lignes };
}

async function enregistrerLiens(tacheId: number, etudeIds: number[]): Promise<void> {
  db.delete(tachesEtudes).where(eq(tachesEtudes.tacheId, tacheId)).run();
  if (etudeIds.length === 0) return;
  db.insert(tachesEtudes)
    .values(etudeIds.map((etudeId) => ({ tacheId, etudeId })))
    .run();
}

async function lireAssigneA(
  donnees: FormData,
  compteId: number,
  etudeIds: number[],
): Promise<{ assigneA: number | null } | { erreur: string }> {
  const brut = String(donnees.get("assigneA") ?? "").trim();
  if (!brut) return { assigneA: null };

  const assigneA = Number(brut);
  if (!Number.isInteger(assigneA) || assigneA <= 0) {
    return { erreur: "Personne introuvable pour cette attribution." };
  }

  const personne = db.select({ id: utilisateurs.id }).from(utilisateurs).where(eq(utilisateurs.id, assigneA)).get();
  if (!personne) return { erreur: "Personne introuvable pour cette attribution." };

  if (etudeIds.length === 0) {
    return { erreur: "Pour attribuer une mission, rattachez-la d'abord à une étude." };
  }

  for (const etudeId of etudeIds) {
    await assurerPartageEtude(etudeId, assigneA, compteId);
  }
  return { assigneA };
}

export async function creerTache(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const titre = String(donnees.get("titre") ?? "").trim();
    if (!titre) return { erreur: "Le titre de la tâche est obligatoire." };

    const etudeIds = lireEtudeIds(donnees);
    const possession = await exigerProprietaireDesEtudes(etudeIds, compte.id);
    if ("erreur" in possession) return { erreur: possession.erreur };

    const attribution = await lireAssigneA(donnees, compte.id, etudeIds);
    if ("erreur" in attribution) return { erreur: attribution.erreur };

    const etapes = String(donnees.get("lignesSousTaches") ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const [creee] = await db
      .insert(taches)
      .values({
        proprietaireId: compte.id,
        etudeId: etudeIds[0] ?? null,
        titre,
        notes: String(donnees.get("notes") ?? "").trim() || null,
        priorite: String(donnees.get("priorite") ?? "normale"),
        echeance: depuisChampDate(String(donnees.get("echeance") ?? "")),
        assigneA: attribution.assigneA,
        couleur: lireCouleur(String(donnees.get("couleur") ?? "")),
        statut: etapes.length > 0 ? "en_cours" : "a_faire",
      })
      .returning({ id: taches.id });

    if (creee) await enregistrerLiens(creee.id, etudeIds);

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
    await exigerEcritureMission(id, compte.id);
    if (!titre) return { erreur: "Le titre de la tâche est obligatoire." };

    const statut = String(donnees.get("statut") ?? "a_faire");
    const etudeIds = lireEtudeIds(donnees);

    const actuelle = db.select().from(taches).where(eq(taches.id, id)).get();
    if (!actuelle) return { erreur: "Tâche introuvable." };

    const possession = await exigerProprietaireDesEtudes(etudeIds, compte.id);
    const estProprietaireEtude = !("erreur" in possession) && etudeIds.length > 0;
    const peutGerer =
      estProprietaireEtude ||
      (etudeIds.length === 0 && actuelle.proprietaireId === compte.id);

    if (!peutGerer) {
      await db
        .update(taches)
        .set({
          notes: String(donnees.get("notes") ?? "").trim() || null,
          statut,
          termineeLe: statut === "terminee" ? maintenant() : null,
          modifieLe: maintenant(),
        })
        .where(eq(taches.id, id));
      await appliquerStatutDepuisEtapes(id);
      revalidatePath("/", "layout");
      return { succes: (precedent.succes ?? 0) + 1 };
    }

    if ("erreur" in possession) return { erreur: possession.erreur };

    const attribution = await lireAssigneA(donnees, compte.id, etudeIds);
    if ("erreur" in attribution) return { erreur: attribution.erreur };

    await db
      .update(taches)
      .set({
        etudeId: etudeIds[0] ?? null,
        titre,
        notes: String(donnees.get("notes") ?? "").trim() || null,
        statut,
        priorite: String(donnees.get("priorite") ?? "normale"),
        echeance: depuisChampDate(String(donnees.get("echeance") ?? "")),
        assigneA: attribution.assigneA,
        couleur: donnees.has("couleur")
          ? lireCouleur(String(donnees.get("couleur") ?? ""))
          : actuelle.couleur,
        termineeLe: statut === "terminee" ? maintenant() : null,
        modifieLe: maintenant(),
      })
      .where(eq(taches.id, id));

    await enregistrerLiens(id, etudeIds);
    await appliquerStatutDepuisEtapes(id);

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
  await exigerEcritureMission(id, compte.id);

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
  await exigerEcritureMission(id, compte.id);

  const etapes = await db
    .select({ id: sousTaches.id })
    .from(sousTaches)
    .where(eq(sousTaches.tacheId, id))
    .limit(1);
  if (etapes.length > 0) {
    await appliquerStatutDepuisEtapes(id);
    revalidatePath("/", "layout");
    return;
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
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Tâche manquante.");
  await exigerGestionMission(id, compte.id);

  await db.delete(taches).where(eq(taches.id, id));
  revalidatePath("/", "layout");
}

/**
 * Aligne le statut de la mission sur ses étapes, s'il y en a.
 * Sans étape, le statut manuel est laissé tel quel.
 */
async function appliquerStatutDepuisEtapes(tacheId: number) {
  const etapes = await db
    .select({ faite: sousTaches.faite })
    .from(sousTaches)
    .where(eq(sousTaches.tacheId, tacheId));
  const [mission] = await db
    .select({ statut: taches.statut })
    .from(taches)
    .where(eq(taches.id, tacheId))
    .limit(1);
  if (!mission) return;

  const statut = statutDepuisEtapes(mission.statut, etapes);
  if (statut === mission.statut) return;

  await db
    .update(taches)
    .set({
      statut,
      termineeLe: statut === "terminee" ? maintenant() : null,
      modifieLe: maintenant(),
    })
    .where(eq(taches.id, tacheId));
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
  await exigerEcritureMission(ligne.tacheId, utilisateurId);
  return ligne;
}

export async function ajouterSousTache(donnees: FormData) {
  const compte = await exigerSession();

  const tacheId = Number(donnees.get("tacheId"));
  const titre = String(donnees.get("titre") ?? "").trim();
  if (!tacheId) throw new Error("Mission manquante.");
  if (!titre) throw new Error("Le titre de l'étape est obligatoire.");
  await exigerEcritureMission(tacheId, compte.id);

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
  await appliquerStatutDepuisEtapes(tacheId);
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
  await appliquerStatutDepuisEtapes(ligne.tacheId);
  revalidatePath("/", "layout");
}

export async function supprimerSousTache(donnees: FormData) {
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Étape manquante.");
  const ligne = await sousTacheAccessible(id, compte.id);

  await db.delete(sousTaches).where(eq(sousTaches.id, id));
  await appliquerStatutDepuisEtapes(ligne.tacheId);
  revalidatePath("/", "layout");
}
