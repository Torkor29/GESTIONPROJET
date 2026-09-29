"use server";

import { and, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { etudes, sousTaches, taches, tachesEtudes, utilisateurs } from "@/db/schema";
import {
  etudeAccessible,
  exigerAcces,
  exigerEcritureMission,
  exigerGestionMission,
  missionVisible,
  piloteLesEtudes,
} from "@/lib/acces";
import { dansLaPurge } from "@/lib/archives";
import { exigerSession, utilisateurActuel } from "@/lib/auth";
import { depuisChampDate, statutDepuisEtapes } from "@/lib/format";
import { LIBELLES_STATUT_LIGNE_MISSION } from "@/lib/constantes";
import { normaliserAcronyme, statutDeduit } from "@/lib/missions";
import { lireCouleur } from "@/lib/couleurs";
import { assurerPartageEtude } from "./partages";
import { type EtatFormulaire, messageErreur } from "./etat";
import { redigerCourrierAttribution } from "@/lib/courrier-attribution";
import { doitPrevenirAttribution } from "@/lib/courrier";
import { envoyerCourrier } from "@/lib/envoyer-courrier";
import { lienTimeline } from "@/lib/timeline";
import { SITE_URL } from "@/lib/site";

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
  // Le droit « accès à toutes les études » vaut propriété, pour les missions.
  if (!(await piloteLesEtudes(etudeIds, compteId))) {
    return { erreur: "Seul le propriétaire peut rattacher une mission à ces études." };
  }
  return { etudes: lignes };
}

/** Un acronyme n'est qu'une étiquette : au-delà, c'est une faute de frappe. */
const LONGUEUR_MAX_ACRONYME = 40;

/**
 * Études désignées par un acronyme saisi à la volée : retrouvées parmi les
 * études accessibles — sans quoi deux personnes tapant « PAPAYE » créeraient
 * deux dossiers —, sinon créées au nom de qui les a saisies. On les complète
 * ensuite depuis leur fiche.
 */
async function etudesDepuisAcronymes(
  donnees: FormData,
  compteId: number,
): Promise<{ ids: number[] } | { erreur: string }> {
  const acronymes = new Set(
    donnees
      .getAll("nouvellesEtudes")
      .map((v) => normaliserAcronyme(String(v)))
      .filter(Boolean),
  );
  const ids: number[] = [];
  for (const acronyme of acronymes) {
    if (acronyme.length > LONGUEUR_MAX_ACRONYME) {
      return { erreur: `L'acronyme « ${acronyme.slice(0, 20)}… » est trop long.` };
    }
    const [existante] = await db
      .select({ id: etudes.id })
      .from(etudes)
      .where(
        and(
          sql`(upper(${etudes.code}) = ${acronyme} or upper(${etudes.nom}) = ${acronyme})`,
          etudeAccessible(etudes.id, compteId),
        ),
      )
      .limit(1);
    if (existante) {
      ids.push(existante.id);
      continue;
    }
    const [creee] = await db
      .insert(etudes)
      .values({ proprietaireId: compteId, nom: acronyme, code: acronyme })
      .returning({ id: etudes.id });
    ids.push(creee.id);
  }
  return { ids };
}

/** Études cochées et acronymes nouveaux, créés à la volée. */
async function lireEtudesChoisies(
  donnees: FormData,
  compteId: number,
): Promise<{ ids: number[] } | { erreur: string }> {
  const nouvelles = await etudesDepuisAcronymes(donnees, compteId);
  if ("erreur" in nouvelles) return nouvelles;
  return { ids: [...new Set([...lireEtudeIds(donnees), ...nouvelles.ids])] };
}

function lireType(donnees: FormData): string | null {
  return String(donnees.get("type") ?? "").trim().slice(0, 60) || null;
}

/**
 * Rattache la mission à ses études. Les études déjà liées gardent leur
 * avancement propre : on n'ajoute et on ne retire que la différence.
 */
async function enregistrerLiens(tacheId: number, etudeIds: number[]): Promise<void> {
  const avant = db
    .select({ etudeId: tachesEtudes.etudeId })
    .from(tachesEtudes)
    .where(eq(tachesEtudes.tacheId, tacheId))
    .all()
    .map((l) => l.etudeId);

  const aRetirer = avant.filter((e) => !etudeIds.includes(e));
  if (aRetirer.length > 0) {
    db.delete(tachesEtudes)
      .where(and(eq(tachesEtudes.tacheId, tacheId), inArray(tachesEtudes.etudeId, aRetirer)))
      .run();
  }
  const aAjouter = etudeIds.filter((e) => !avant.includes(e));
  if (aAjouter.length > 0) {
    db.insert(tachesEtudes)
      .values(aAjouter.map((etudeId) => ({ tacheId, etudeId })))
      .run();
  }
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

const AVERTISSEMENT_COURRIER =
  "La mission est enregistrée, mais le courrier n'est pas parti. Vérifiez la messagerie du serveur.";

async function prevenirAttribution(opts: {
  assigneA: number | null;
  precedent?: number | null;
  auteurId: number;
  auteurNom: string;
  titre: string;
  notes: string | null;
  priorite: string;
  echeance: number | null;
  etudeIds: number[];
}): Promise<string | undefined> {
  if (!doitPrevenirAttribution(opts.assigneA, opts.precedent, opts.auteurId)) return;

  const dest = db
    .select({ nom: utilisateurs.nom, email: utilisateurs.email })
    .from(utilisateurs)
    .where(eq(utilisateurs.id, opts.assigneA))
    .get();
  if (!dest) return;

  const etudesLiees =
    opts.etudeIds.length > 0
      ? db
          .select({ nom: etudes.nom, code: etudes.code })
          .from(etudes)
          .where(inArray(etudes.id, opts.etudeIds))
          .all()
      : [];

  const { sujet, texte } = redigerCourrierAttribution({
    destinataireNom: dest.nom,
    parNom: opts.auteurNom,
    titre: opts.titre,
    notes: opts.notes,
    priorite: opts.priorite,
    echeance: opts.echeance,
    etudes: etudesLiees,
    href: `${SITE_URL}${lienTimeline(opts.etudeIds)}`,
  });

  const envoi = await envoyerCourrier({ a: dest.email, sujet, texte });
  if (!envoi.ok && envoi.raison === "echec") return AVERTISSEMENT_COURRIER;
  return;
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

    const choix = await lireEtudesChoisies(donnees, compte.id);
    if ("erreur" in choix) return { erreur: choix.erreur };
    const etudeIds = choix.ids;
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
        type: lireType(donnees),
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
    const avertissement = await prevenirAttribution({
      assigneA: attribution.assigneA,
      auteurId: compte.id,
      auteurNom: compte.nom,
      titre,
      notes: String(donnees.get("notes") ?? "").trim() || null,
      priorite: String(donnees.get("priorite") ?? "normale"),
      echeance: depuisChampDate(String(donnees.get("echeance") ?? "")),
      etudeIds,
    });
    return {
      succes: (precedent.succes ?? 0) + 1,
      ...(avertissement ? { avertissement } : {}),
    };
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

    const actuelle = db.select().from(taches).where(eq(taches.id, id)).get();
    if (!actuelle) return { erreur: "Tâche introuvable." };

    // Les acronymes nouveaux ne se créent que pour qui peut rattacher des
    // études : l'édition restreinte ne les propose pas.
    const choix = donnees.getAll("nouvellesEtudes").length > 0
      ? await lireEtudesChoisies(donnees, compte.id)
      : { ids: lireEtudeIds(donnees) };
    if ("erreur" in choix) return { erreur: choix.erreur };
    const etudeIds = choix.ids;

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
          archiveeLe: statut === "terminee" ? actuelle.archiveeLe : null,
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
        type: donnees.has("type") ? lireType(donnees) : actuelle.type,
        notes: String(donnees.get("notes") ?? "").trim() || null,
        statut,
        priorite: String(donnees.get("priorite") ?? "normale"),
        echeance: depuisChampDate(String(donnees.get("echeance") ?? "")),
        assigneA: attribution.assigneA,
        couleur: donnees.has("couleur")
          ? lireCouleur(String(donnees.get("couleur") ?? ""))
          : actuelle.couleur,
        termineeLe: statut === "terminee" ? maintenant() : null,
        archiveeLe: statut === "terminee" ? actuelle.archiveeLe : null,
        modifieLe: maintenant(),
      })
      .where(eq(taches.id, id));

    await enregistrerLiens(id, etudeIds);
    await appliquerStatutDepuisEtapes(id);

    revalidatePath("/", "layout");
    const avertissement = await prevenirAttribution({
      assigneA: attribution.assigneA,
      precedent: actuelle.assigneA,
      auteurId: compte.id,
      auteurNom: compte.nom,
      titre,
      notes: String(donnees.get("notes") ?? "").trim() || null,
      priorite: String(donnees.get("priorite") ?? "normale"),
      echeance: depuisChampDate(String(donnees.get("echeance") ?? "")),
      etudeIds,
    });
    return {
      succes: (precedent.succes ?? 0) + 1,
      ...(avertissement ? { avertissement } : {}),
    };
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
    .select({ statut: taches.statut, archiveeLe: taches.archiveeLe })
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
      archiveeLe: terminee ? null : tache.archiveeLe,
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
  if (etapes.length > 0 || (await statutsParEtude(id)).length > 0) {
    await appliquerStatutDepuisEtapes(id);
    revalidatePath("/", "layout");
    return;
  }

  await db
    .update(taches)
    .set({
      statut,
      termineeLe: statut === "terminee" ? maintenant() : null,
      ...(statut !== "terminee" ? { archiveeLe: null } : {}),
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

/** Range une mission terminée : elle quitte le suivi, les données restent. */
export async function archiverTache(donnees: FormData) {
  const compte = await exigerSession();
  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Tâche manquante.");
  await exigerEcritureMission(id, compte.id);

  const [tache] = await db.select().from(taches).where(eq(taches.id, id)).limit(1);
  if (!tache) throw new Error("Tâche introuvable.");
  const etapes = await db
    .select({ faite: sousTaches.faite })
    .from(sousTaches)
    .where(eq(sousTaches.tacheId, id));
  if (statutDepuisEtapes(tache.statut, etapes) !== "terminee") {
    throw new Error("On n'archive qu'une mission terminée.");
  }

  await db
    .update(taches)
    .set({ archiveeLe: tache.archiveeLe ?? maintenant(), modifieLe: maintenant() })
    .where(eq(taches.id, id));
  revalidatePath("/", "layout");
}

/** Remet une archive dans le suivi. */
export async function desarchiverTache(donnees: FormData) {
  const compte = await exigerSession();
  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Tâche manquante.");
  await exigerEcritureMission(id, compte.id);

  await db
    .update(taches)
    .set({ archiveeLe: null, modifieLe: maintenant() })
    .where(eq(taches.id, id));
  revalidatePath("/", "layout");
}

export type EtatArchives = { message?: string; erreur?: string };

/**
 * Retire définitivement des archives. Sans date : tout ce que la personne
 * peut gérer. Avec une date : les missions terminées ce jour-là ou avant.
 * Le temps saisi reste, détaché de la mission.
 */
export async function viderArchives(
  _precedent: EtatArchives,
  donnees: FormData,
): Promise<EtatArchives> {
  try {
    const compte = await exigerSession();
    if (String(donnees.get("confirmer") ?? "") !== "1") {
      return { erreur: "Cochez la confirmation pour retirer définitivement." };
    }

    const tout = String(donnees.get("tout") ?? "") === "1";
    const avant = depuisChampDate(String(donnees.get("avant") ?? ""));
    if (!tout && avant == null) {
      return { erreur: "Indiquez une date, ou videz tout." };
    }

    const archivees = await db
      .select({
        id: taches.id,
        termineeLe: taches.termineeLe,
        archiveeLe: taches.archiveeLe,
      })
      .from(taches)
      .where(and(isNotNull(taches.archiveeLe), missionVisible(compte.id)));

    const retenues: number[] = [];
    for (const t of archivees) {
      if (!dansLaPurge(t, tout ? null : avant)) continue;
      try {
        await exigerGestionMission(t.id, compte.id);
        retenues.push(t.id);
      } catch {
        // Pas le propriétaire : on laisse l'archive telle quelle.
      }
    }

    if (retenues.length === 0) {
      return { message: "Aucune archive à retirer." };
    }

    await db.delete(taches).where(inArray(taches.id, retenues));
    revalidatePath("/", "layout");
    return {
      message:
        retenues.length === 1
          ? "1 mission retirée des archives."
          : `${retenues.length} missions retirées des archives.`,
    };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

/** Avancement par étude, pour une mission rattachée à plusieurs études. */
async function statutsParEtude(tacheId: number): Promise<string[]> {
  const lignes = await db
    .select({ statut: tachesEtudes.statut })
    .from(tachesEtudes)
    .where(eq(tachesEtudes.tacheId, tacheId));
  return lignes.length > 1 ? lignes.map((l) => l.statut) : [];
}

/**
 * Aligne le statut de la mission sur ses étapes, s'il y en a ; sinon, pour
 * une mission à plusieurs études, sur l'avancement de chacune. Sans l'un ni
 * l'autre, le statut manuel est laissé tel quel.
 */
async function appliquerStatutDepuisEtapes(tacheId: number) {
  const etapes = await db
    .select({ faite: sousTaches.faite })
    .from(sousTaches)
    .where(eq(sousTaches.tacheId, tacheId));
  const [mission] = await db
    .select({ statut: taches.statut, archiveeLe: taches.archiveeLe, termineeLe: taches.termineeLe })
    .from(taches)
    .where(eq(taches.id, tacheId))
    .limit(1);
  if (!mission) return;

  const parEtude = etapes.length === 0 ? await statutsParEtude(tacheId) : [];
  const statut =
    parEtude.length > 0 ? statutDeduit(parEtude) : statutDepuisEtapes(mission.statut, etapes);
  const archiveeLe = statut === "terminee" ? mission.archiveeLe : null;
  if (statut === mission.statut && archiveeLe === mission.archiveeLe) return;

  await db
    .update(taches)
    .set({
      statut,
      termineeLe: statut === "terminee" ? (mission.termineeLe ?? maintenant()) : null,
      archiveeLe,
      modifieLe: maintenant(),
    })
    .where(eq(taches.id, tacheId));
}

/**
 * Une étude d'une mission s'avance par qui porte la mission (son auteur, la
 * personne à qui elle est attribuée) ou par qui pilote cette étude-là : le
 * propriétaire d'une autre étude du lot n'y touche pas.
 */
async function exigerEcritureEtudeMission(tacheId: number, etudeId: number, utilisateurId: number) {
  await exigerEcritureMission(tacheId, utilisateurId);
  const [tache] = await db
    .select({ proprietaireId: taches.proprietaireId, assigneA: taches.assigneA })
    .from(taches)
    .where(eq(taches.id, tacheId))
    .limit(1);
  if (tache?.proprietaireId === utilisateurId || tache?.assigneA === utilisateurId) return;
  if (await piloteLesEtudes([etudeId], utilisateurId)) return;
  throw new Error("Seule l'équipe de cette étude peut en changer l'avancement.");
}

/** Avancement d'une mission pour l'une de ses études. */
export async function definirStatutEtudeMission(tacheId: number, etudeId: number, statut: string) {
  const compte = await exigerSession();
  if (!tacheId || !etudeId || !(statut in LIBELLES_STATUT_LIGNE_MISSION)) {
    throw new Error("Statut invalide.");
  }
  await exigerEcritureEtudeMission(tacheId, etudeId, compte.id);

  const faite = await db
    .update(tachesEtudes)
    .set({ statut, termineeLe: statut === "terminee" ? maintenant() : null })
    .where(and(eq(tachesEtudes.tacheId, tacheId), eq(tachesEtudes.etudeId, etudeId)))
    .returning({ etudeId: tachesEtudes.etudeId });
  if (faite.length === 0) throw new Error("Cette étude n'est pas rattachée à la mission.");

  await appliquerStatutDepuisEtapes(tacheId);
  revalidatePath("/", "layout");
}

/** Commentaire propre à une étude, sur une mission à plusieurs études. */
export async function definirNoteEtudeMission(tacheId: number, etudeId: number, notes: string) {
  const compte = await exigerSession();
  if (!tacheId || !etudeId) throw new Error("Étude manquante.");
  await exigerEcritureEtudeMission(tacheId, etudeId, compte.id);

  await db
    .update(tachesEtudes)
    .set({ notes: notes.trim().slice(0, 2000) || null })
    .where(and(eq(tachesEtudes.tacheId, tacheId), eq(tachesEtudes.etudeId, etudeId)));
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
