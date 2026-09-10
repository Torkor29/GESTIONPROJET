import "server-only";
import { and, eq, inArray, sql, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { checklistItems, documents, etudes, faq, pages, partages, taches, tachesEtudes, temps } from "@/db/schema";

/**
 * Cloisonnement des données entre comptes.
 *
 * La règle tient en deux lignes :
 *   — une étude est accessible à son propriétaire et aux personnes conviées ;
 *   — tout ce qui pend d'une étude suit l'accès de cette étude, et un objet
 *     sans étude n'est visible que de son propriétaire.
 *
 * Tout passe par ces deux fonctions : c'est le seul endroit à relire pour
 * s'assurer qu'aucune donnée ne fuit d'un compte à l'autre.
 */

/**
 * Sous-requête rendant les identifiants d'études accessibles à quelqu'un.
 *
 * Écrite en SQL brut plutôt qu'en sous-requête Drizzle : elle s'insère dans un
 * `IN (…)` au milieu de requêtes qui joignent déjà `etudes`, et une sous-requête
 * typée y réintroduirait l'alias de la table englobante.
 */
export function idsEtudesAccessibles(utilisateurId: number): SQL {
  return sql`(
    select id from etudes where proprietaire_id = ${utilisateurId}
    union
    select ressource_id from partages
      where type = 'etude' and utilisateur_id = ${utilisateurId}
  )`;
}

/** Études dont la personne est propriétaire — pas seulement conviée. */
export function idsEtudesPossedees(utilisateurId: number): SQL {
  return sql`(select id from etudes where proprietaire_id = ${utilisateurId})`;
}

/** Condition à poser sur la table `etudes` elle-même. */
export function etudeAccessible(colonneId: SQLiteColumn, utilisateurId: number): SQL {
  return sql`${colonneId} in ${idsEtudesAccessibles(utilisateurId)}`;
}

/**
 * Condition à poser sur une table rattachée à une étude (missions, documents,
 * pages, FAQ, temps). Un objet est visible si son propriétaire est la personne
 * connectée, **ou** s'il appartient à une étude à laquelle elle a accès.
 *
 * Les deux branches sont nécessaires : la première couvre les objets sans
 * étude, la seconde ceux d'une étude partagée mais créés par quelqu'un d'autre.
 */
export function objetAccessible(
  colonneProprietaire: SQLiteColumn,
  colonneEtude: SQLiteColumn,
  utilisateurId: number,
): SQL {
  return sql`(
    ${colonneProprietaire} = ${utilisateurId}
    or ${colonneEtude} in ${idsEtudesAccessibles(utilisateurId)}
  )`;
}

/**
 * Une mission n'est visible que si on l'a créée, qu'on nous l'a attribuée,
 * ou qu'on possède l'une des études concernées. Être convié ne suffit pas.
 */
export function missionVisible(utilisateurId: number): SQL {
  return sql`(
    ${taches.proprietaireId} = ${utilisateurId}
    or ${taches.assigneA} = ${utilisateurId}
    or ${taches.etudeId} in ${idsEtudesPossedees(utilisateurId)}
    or exists (
      select 1 from taches_etudes
      where taches_etudes.tache_id = ${taches.id}
        and taches_etudes.etude_id in ${idsEtudesPossedees(utilisateurId)}
    )
  )`;
}

/** La mission est rattachée à cette étude (lien direct ou table de jointure). */
export function missionLieeA(etudeId: number): SQL {
  return sql`(
    ${taches.etudeId} = ${etudeId}
    or exists (
      select 1 from taches_etudes
      where taches_etudes.tache_id = ${taches.id}
        and taches_etudes.etude_id = ${etudeId}
    )
  )`;
}

/* -------------------------------------------------------------------------- */
/*  Garde des écritures                                                       */
/* -------------------------------------------------------------------------- */

const REFUS = "Vous n'avez pas accès à cet élément.";

/** Tables rattachées à une étude, toutes gardées de la même façon. */
const RATTACHEES = { taches, documents, pages, faq, temps } as const;

export type EntiteGardee = keyof typeof RATTACHEES | "etudes";

/**
 * À appeler en tête de toute écriture visant un identifiant reçu du client.
 *
 * Sans cela, une personne connectée pourrait modifier ou supprimer les données
 * d'une autre en devinant un identifiant : la session prouve qu'on est
 * quelqu'un, pas qu'on a le droit de toucher à cet objet-là.
 */
export async function exigerAcces(
  entite: EntiteGardee,
  id: number,
  utilisateurId: number,
): Promise<void> {
  if (entite === "etudes") {
    const [ligne] = await db
      .select({ id: etudes.id })
      .from(etudes)
      .where(and(eq(etudes.id, id), etudeAccessible(etudes.id, utilisateurId)))
      .limit(1);
    if (!ligne) throw new Error(REFUS);
    return;
  }

  const table = RATTACHEES[entite];
  const garde =
    entite === "taches"
      ? missionVisible(utilisateurId)
      : objetAccessible(table.proprietaireId, table.etudeId, utilisateurId);
  const [ligne] = await db
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.id, id), garde))
    .limit(1);
  if (!ligne) throw new Error(REFUS);
}

const REFUS_ECRITURE = "Vous pouvez consulter cette mission, pas la modifier.";
const REFUS_GESTION = "Seul le propriétaire peut supprimer ou réattribuer cette mission.";

async function tacheSiAccessible(id: number, utilisateurId: number) {
  await exigerAcces("taches", id, utilisateurId);
  const [ligne] = await db.select().from(taches).where(eq(taches.id, id)).limit(1);
  if (!ligne) throw new Error(REFUS);
  return ligne;
}

export async function idsEtudesDeMission(tacheId: number): Promise<number[]> {
  const liens = await db
    .select({ etudeId: tachesEtudes.etudeId })
    .from(tachesEtudes)
    .where(eq(tachesEtudes.tacheId, tacheId));
  const ids = liens.map((l) => l.etudeId);
  const [tache] = await db
    .select({ etudeId: taches.etudeId })
    .from(taches)
    .where(eq(taches.id, tacheId))
    .limit(1);
  if (tache?.etudeId != null && !ids.includes(tache.etudeId)) ids.unshift(tache.etudeId);
  return ids;
}

async function possedeUneEtudeLiee(etudeIds: number[], utilisateurId: number): Promise<boolean> {
  if (etudeIds.length === 0) return false;
  const [ligne] = await db
    .select({ id: etudes.id })
    .from(etudes)
    .where(and(eq(etudes.proprietaireId, utilisateurId), inArray(etudes.id, etudeIds)))
    .limit(1);
  return Boolean(ligne);
}

/**
 * Avancer une mission (statut, étapes, commentaire, temps) : propriétaire de
 * l'une des études, auteur d'une mission sans étude, ou personne à qui elle
 * est attribuée en écriture. Un accès en lecture ne suffit pas.
 */
export async function exigerEcritureMission(id: number, utilisateurId: number): Promise<void> {
  const tache = await tacheSiAccessible(id, utilisateurId);
  if (tache.proprietaireId === utilisateurId) return;
  const etudeIds = await idsEtudesDeMission(id);
  if (await possedeUneEtudeLiee(etudeIds, utilisateurId)) return;
  if (tache.assigneA === utilisateurId && etudeIds.length > 0) {
    const [partage] = await db
      .select({ niveau: partages.niveau })
      .from(partages)
      .where(
        and(
          eq(partages.type, "etude"),
          eq(partages.utilisateurId, utilisateurId),
          inArray(partages.ressourceId, etudeIds),
          eq(partages.niveau, "ecriture"),
        ),
      )
      .limit(1);
    if (partage) return;
  }
  throw new Error(REFUS_ECRITURE);
}

/** Créer / supprimer / réattribuer : propriétaire d'une étude liée, ou de la mission sans étude. */
export async function exigerGestionMission(id: number, utilisateurId: number): Promise<void> {
  const tache = await tacheSiAccessible(id, utilisateurId);
  const etudeIds = await idsEtudesDeMission(id);
  if (await possedeUneEtudeLiee(etudeIds, utilisateurId)) return;
  if (etudeIds.length === 0 && tache.proprietaireId === utilisateurId) return;
  throw new Error(REFUS_GESTION);
}

/**
 * Une ligne de checklist n'a pas de propriétaire propre : elle suit l'étude
 * dont elle dépend.
 */
export async function exigerAccesChecklist(id: number, utilisateurId: number): Promise<void> {
  const [ligne] = await db
    .select({ id: checklistItems.id })
    .from(checklistItems)
    .where(
      and(
        eq(checklistItems.id, id),
        sql`${checklistItems.etudeId} in ${idsEtudesAccessibles(utilisateurId)}`,
      ),
    )
    .limit(1);
  if (!ligne) throw new Error(REFUS);
}
