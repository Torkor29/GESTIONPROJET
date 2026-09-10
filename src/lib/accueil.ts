/** Widgets du tableau de bord : on affiche ou on range, chacun compose le sien. */

export type WidgetAccueil = {
  cle: string;
  nom: string;
  description: string;
};

export const WIDGETS_ACCUEIL: WidgetAccueil[] = [
  {
    cle: "ajouts",
    nom: "Ajouts rapides",
    description: "Créer une mission, un document, une étude, sans changer de page.",
  },
  {
    cle: "chiffres",
    nom: "Indicateurs",
    description: "Missions ouvertes, conformité, temps de la semaine, études actives.",
  },
  {
    cle: "timeline",
    nom: "Échéances",
    description: "Calendrier des quatre prochaines semaines, retards en tête.",
  },
  {
    cle: "inclusion",
    nom: "Fin d'inclusion",
    description: "Rappel des études dont la fin d'inclusion approche.",
  },
  {
    cle: "priorite",
    nom: "À traiter",
    description: "Les missions les plus urgentes, en cartes.",
  },
  {
    cle: "projets",
    nom: "Projets",
    description: "Les études en cours, avec leur avancement.",
  },
  {
    cle: "temps",
    nom: "Temps de la semaine",
    description: "Répartition du temps saisi, par étude.",
  },
];

export const WIDGETS_PAR_DEFAUT = WIDGETS_ACCUEIL.map((w) => w.cle);

const CONNUES = new Set(WIDGETS_PAR_DEFAUT);

export function lireWidgetsAccueil(json: string | null | undefined): string[] {
  if (!json) return [...WIDGETS_PAR_DEFAUT];
  try {
    const brut = JSON.parse(json) as unknown;
    if (!Array.isArray(brut)) return [...WIDGETS_PAR_DEFAUT];
    const retenus = brut.filter((c): c is string => typeof c === "string" && CONNUES.has(c));
    return retenus;
  } catch {
    return [...WIDGETS_PAR_DEFAUT];
  }
}

export function widgetVisible(actifs: readonly string[], cle: string): boolean {
  return actifs.includes(cle);
}
