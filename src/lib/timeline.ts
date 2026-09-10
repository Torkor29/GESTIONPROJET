import { couleurAffichee } from "./couleurs";
import { debutDeJour, debutDeSemaine, SECONDES_PAR_JOUR, versChampDate } from "./format";

export type MissionTimeline = {
  id: number;
  titre: string;
  echeance: number;
  couleur: string;
  etudeCode?: string | null;
  href: string;
};

export type GrilleTimeline = {
  retard: MissionTimeline[];
  jours: { debut: number; iso: string; aujourdhui: boolean }[];
  parJour: Map<string, MissionTimeline[]>;
};

const JOURS_AFFICHES = 28;

/** Minuit local du jour qui contient `secondes`. */
export const debutDuJour = debutDeJour;

/** Une étude → l'onglet Missions du dossier ; plusieurs → le suivi. */
export function lienTimeline(etudeIds: readonly number[]): string {
  if (etudeIds.length === 1) return `/etudes/${etudeIds[0]}?section=missions`;
  return "/missions";
}

export function missionsPourTimeline(
  lignes: {
    tache: {
      id: number;
      titre: string;
      statut: string;
      echeance: number | null;
      couleur: string | null;
    };
    etudesLiees: { id: number; code: string | null }[];
    etudeCouleur?: string | null;
    etudeCode?: string | null;
  }[],
): MissionTimeline[] {
  const resultat: MissionTimeline[] = [];
  for (const l of lignes) {
    if (l.tache.statut === "terminee" || !l.tache.echeance) continue;
    const ids = l.etudesLiees.map((e) => e.id);
    resultat.push({
      id: l.tache.id,
      titre: l.tache.titre,
      echeance: l.tache.echeance,
      couleur: couleurAffichee(l.tache.couleur, l.etudeCouleur),
      etudeCode:
        l.etudesLiees.length === 1
          ? (l.etudesLiees[0].code ?? l.etudeCode)
          : l.etudeCode ?? null,
      href: lienTimeline(ids),
    });
  }
  return resultat;
}

/**
 * Range les missions ouvertes avec échéance : retards à part, le reste
 * sur les quatre semaines à venir (lundi → dimanche).
 */
export function grilleTimeline(
  missions: MissionTimeline[],
  maintenant: number,
  nbJours = JOURS_AFFICHES,
): GrilleTimeline {
  const aujourdhui = debutDuJour(maintenant);
  const debut = debutDeSemaine(maintenant);
  const fin = debut + nbJours * SECONDES_PAR_JOUR;

  const jours = Array.from({ length: nbJours }, (_, i) => {
    const d = debut + i * SECONDES_PAR_JOUR;
    return { debut: d, iso: versChampDate(d), aujourdhui: d === aujourdhui };
  });

  const parJour = new Map<string, MissionTimeline[]>();
  const retard: MissionTimeline[] = [];

  const triees = [...missions].sort((a, b) => a.echeance - b.echeance);
  for (const m of triees) {
    const jour = debutDuJour(m.echeance);
    if (jour < aujourdhui) {
      retard.push(m);
      continue;
    }
    if (jour >= fin) continue;
    const iso = versChampDate(jour);
    const deja = parJour.get(iso);
    if (deja) deja.push(m);
    else parJour.set(iso, [m]);
  }

  return { retard, jours, parJour };
}
