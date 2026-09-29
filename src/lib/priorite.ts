import { SECONDES_PAR_JOUR } from "./format";

/** Une mission normale n'entre dans « À traiter » que si l'échéance est dans cet horizon. */
export const JOURS_HORIZON_PRIORITE = 21;

/** En deçà, le délai est « court » : or sur la carte, date plus marquée. */
export const JOURS_DELAI_COURT = 7;

export type NiveauDelai = "retard" | "court" | null;

export type TachePourPriorite = {
  statut: string;
  priorite: string;
  echeance: number | null;
};

/** Retard (déjà passé) ou délai de moins de sept jours. Sinon `null`. */
export function niveauDelai(
  echeance: number | null,
  maintenant: number,
): NiveauDelai {
  if (!echeance) return null;
  if (echeance < maintenant) return "retard";
  if (echeance <= maintenant + JOURS_DELAI_COURT * SECONDES_PAR_JOUR) return "court";
  return null;
}

/**
 * Couleur de la barre gauche selon l'urgence du délai.
 * Corail = en retard, or = cette semaine. `null` : on garde la couleur de l'étude.
 */
export function couleurBarreDelai(niveau: NiveauDelai): string | null {
  if (niveau === "retard") return "rgb(var(--corail))";
  if (niveau === "court") return "rgb(var(--or))";
  return null;
}

/**
 * Une mission figure dans « À traiter en priorité » si elle n'est pas
 * terminée, n'est pas « peu importante », et qu'elle est soit importante,
 * soit munie d'une échéance proche (y compris déjà passée).
 */
export function meriteBlocPriorite(tache: TachePourPriorite, maintenant: number): boolean {
  if (tache.statut === "terminee") return false;
  if (tache.priorite === "basse") return false;
  if (tache.priorite === "haute") return true;
  if (!tache.echeance) return false;
  return tache.echeance <= maintenant + JOURS_HORIZON_PRIORITE * SECONDES_PAR_JOUR;
}

function rangTri(tache: TachePourPriorite, maintenant: number): number {
  const niveau = niveauDelai(tache.echeance, maintenant);
  if (niveau === "retard") return 0;
  if (niveau === "court") return 1;
  if (tache.echeance) return 2;
  return 3;
}

export function comparerMissionsPriorite(
  a: TachePourPriorite,
  b: TachePourPriorite,
  maintenant: number,
): number {
  const rang = rangTri(a, maintenant) - rangTri(b, maintenant);
  if (rang !== 0) return rang;
  const ea = a.echeance ?? Number.POSITIVE_INFINITY;
  const eb = b.echeance ?? Number.POSITIVE_INFINITY;
  if (ea !== eb) return ea - eb;
  const poids = (p: string) => (p === "haute" ? 0 : 1);
  return poids(a.priorite) - poids(b.priorite);
}

export function missionsATraiter<T extends { tache: TachePourPriorite }>(
  lignes: T[],
  maintenant: number,
  limite = 10,
): T[] {
  return lignes
    .filter((l) => meriteBlocPriorite(l.tache, maintenant))
    .sort((a, b) => comparerMissionsPriorite(a.tache, b.tache, maintenant))
    .slice(0, limite);
}
