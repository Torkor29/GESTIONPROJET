import "server-only";
import { and, eq, sql, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import {
  checklistItems,
  documents,
  etudes,
  faq,
  pages,
  tacheEtudes,
  taches,
  temps,
} from "@/db/schema";

/**
 * Cloisonnement des données entre comptes.
 *
 * La règle tient en deux lignes :
 *   — une étude est accessible à son propriétaire, aux personnes conviées, et
 *     aux comptes qui détiennent le droit « accès à toutes les études » ;
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
  // Le droit est relu en base à chaque requête, pas mis en cache : le retirer
  // prend effet immédiatement, sans attendre une reconnexion.
  return sql`(
    select id from etudes
      where proprietaire_id = ${utilisateurId}
        or exists (
          select 1 from utilisateurs
            where utilisateurs.id = ${utilisateurId} and utilisateurs.acces_toutes_etudes = 1
        )
    union
    select ressource_id from partages
      where type = 'etude' and utilisateur_id = ${utilisateurId}
  )`;
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
  const [ligne] = await db
    .select({ id: table.id })
    .from(table)
    .where(
      and(eq(table.id, id), objetAccessible(table.proprietaireId, table.etudeId, utilisateurId)),
    )
    .limit(1);
  if (!ligne) throw new Error(REFUS);
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

/**
 * Mission portée sur plusieurs études : elle est aussi visible de qui a accès
 * à l'une de ses études, pour que l'équipe d'une étude voie ce qui la concerne.
 * Cette personne n'en voit alors que les lignes de ses propres études.
 */
export function missionVisibleParSesEtudes(colonneTacheId: SQLiteColumn, utilisateurId: number): SQL {
  return sql`${colonneTacheId} in (
    select tache_id from tache_etudes where etude_id in ${idsEtudesAccessibles(utilisateurId)}
  )`;
}

/**
 * Une ligne « mission × étude » se lit et se met à jour par qui a accès à la
 * mission, ou à l'étude de la ligne : l'équipe d'une étude peut ainsi faire
 * avancer sa part d'une mission transverse sans pouvoir toucher au reste.
 */
export function ligneMissionAccessible(utilisateurId: number): SQL {
  return sql`(
    ${tacheEtudes.etudeId} in ${idsEtudesAccessibles(utilisateurId)}
    or ${tacheEtudes.tacheId} in (
      select id from taches
        where proprietaire_id = ${utilisateurId}
          or etude_id in ${idsEtudesAccessibles(utilisateurId)}
    )
  )`;
}

export async function exigerAccesLigneMission(id: number, utilisateurId: number): Promise<void> {
  const [ligne] = await db
    .select({ id: tacheEtudes.id })
    .from(tacheEtudes)
    .where(and(eq(tacheEtudes.id, id), ligneMissionAccessible(utilisateurId)))
    .limit(1);
  if (!ligne) throw new Error(REFUS);
}
