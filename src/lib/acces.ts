import "server-only";
import { and, eq, sql, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { checklistItems, documents, etudes, faq, pages, taches, temps } from "@/db/schema";

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
