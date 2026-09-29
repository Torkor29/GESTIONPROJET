import { SECONDES_PAR_JOUR } from "./format";

/** Une mission archivée a une date d'archivage. */
export function estArchivee(archiveeLe: number | null | undefined): boolean {
  return archiveeLe != null;
}

/**
 * Date retenue pour vider les archives : le jour où la mission a été
 * terminée, à défaut le jour où on l'a rangée.
 */
export function datePourPurge(
  termineeLe: number | null | undefined,
  archiveeLe: number | null | undefined,
): number | null {
  return termineeLe ?? archiveeLe ?? null;
}

/**
 * `avant` est la date saisie (minuit local). On retire ce qui est terminé
 * ce jour-là ou avant — donc tout instant strictement avant le lendemain.
 * Sans date : tout ce qui est déjà archivé.
 */
export function dansLaPurge(
  mission: {
    termineeLe?: number | null;
    archiveeLe?: number | null;
  },
  avant: number | null,
): boolean {
  if (avant == null) return true;
  const ref = datePourPurge(mission.termineeLe, mission.archiveeLe);
  if (ref == null) return true;
  return ref < avant + SECONDES_PAR_JOUR;
}
