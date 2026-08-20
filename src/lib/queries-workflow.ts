/**
 * Cycle de vie d'une query. Les transitions sont le contrat métier :
 * l'interface et les Server Actions s'y conforment, les tests aussi.
 *
 * Open → Answered → Resolved → Closed
 *              ↘ Reopened ↗
 */

export const STATUTS_QUERY = ["open", "answered", "reopened", "resolved", "closed"] as const;
export type StatutQuery = (typeof STATUTS_QUERY)[number];

export type ActionQuery = "repondre" | "rouvrir" | "resoudre" | "fermer";

export const LIBELLES_STATUT_QUERY: Record<StatutQuery, string> = {
  open: "Ouverte",
  answered: "Répondue",
  reopened: "Rouverte",
  resolved: "Résolue",
  closed: "Fermée",
};

const TRANSITIONS: Record<StatutQuery, Partial<Record<ActionQuery, StatutQuery>>> = {
  open: { repondre: "answered" },
  answered: { rouvrir: "reopened", resoudre: "resolved" },
  reopened: { repondre: "answered" },
  resolved: { fermer: "closed", rouvrir: "reopened" },
  closed: {},
};

export function estStatutQuery(valeur: string): valeur is StatutQuery {
  return (STATUTS_QUERY as readonly string[]).includes(valeur);
}

export function prochainStatutQuery(
  actuel: string,
  action: ActionQuery,
): { ok: true; statut: StatutQuery } | { ok: false; erreur: string } {
  if (!estStatutQuery(actuel)) {
    return { ok: false, erreur: "Statut de query inconnu." };
  }
  const suivant = TRANSITIONS[actuel][action];
  if (!suivant) {
    return {
      ok: false,
      erreur: `Action « ${action} » impossible depuis le statut « ${LIBELLES_STATUT_QUERY[actuel]} ».`,
    };
  }
  return { ok: true, statut: suivant };
}

export function actionsPossibles(actuel: string): ActionQuery[] {
  if (!estStatutQuery(actuel)) return [];
  return Object.keys(TRANSITIONS[actuel]) as ActionQuery[];
}

/** Une query pèse encore sur les indicateurs tant qu'elle n'est ni résolue ni fermée. */
export function queryOuverte(statut: string): boolean {
  return statut === "open" || statut === "answered" || statut === "reopened";
}
