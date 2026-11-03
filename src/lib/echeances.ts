/**
 * Échéances regroupées par horizon : ce qui est en retard, cette semaine, ce
 * mois-ci, plus tard. Sert au résumé d'une étude comme à l'accueil.
 * Aucun accès à la base : on lui donne des échéances déjà lues.
 */

export type NatureEcheance = "mission" | "visite" | "convention" | "jalon";

export type Echeance = {
  cle: string;
  nature: NatureEcheance;
  titre: string;
  /** Précision affichée sous le titre : type de visite, centre, étape… */
  detail?: string | null;
  date: number;
  href: string;
  /** Acronyme de l'étude, quand la liste en mêle plusieurs. */
  etude?: string | null;
  couleur?: string | null;
};

export type HorizonEcheances = {
  cle: "retard" | "semaine" | "mois" | "plus_tard";
  titre: string;
  echeances: Echeance[];
};

const JOUR = 86400;

/** Minuit, heure locale, du jour contenant `instant`. */
export function debutDuJour(instant: number): number {
  const d = new Date(instant * 1000);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

/**
 * Range les échéances par horizon, chacune dans l'ordre chronologique. Un
 * horizon vide n'est pas rendu : la liste ne montre que ce qui existe.
 */
export function regrouperEcheances(
  echeances: Echeance[],
  maintenant: number,
  limiteJours = 120,
): HorizonEcheances[] {
  const aujourdhui = debutDuJour(maintenant);
  const finSemaine = aujourdhui + 7 * JOUR;
  const finMois = aujourdhui + 31 * JOUR;
  const limite = aujourdhui + limiteJours * JOUR;
  const triees = [...echeances].sort((a, b) => a.date - b.date);

  const horizons: HorizonEcheances[] = [
    { cle: "retard", titre: "En retard", echeances: triees.filter((e) => e.date < aujourdhui) },
    {
      cle: "semaine",
      titre: "Dans les 7 jours",
      echeances: triees.filter((e) => e.date >= aujourdhui && e.date < finSemaine),
    },
    {
      cle: "mois",
      titre: "Ce mois-ci",
      echeances: triees.filter((e) => e.date >= finSemaine && e.date < finMois),
    },
    {
      cle: "plus_tard",
      titre: "Plus tard",
      echeances: triees.filter((e) => e.date >= finMois && e.date < limite),
    },
  ];
  return horizons.filter((h) => h.echeances.length > 0);
}

/** « aujourd'hui », « demain », « dans 5 j », « il y a 2 j ». */
export function delaiRelatif(date: number, maintenant: number): string {
  const ecart = Math.round((debutDuJour(date) - debutDuJour(maintenant)) / JOUR);
  if (ecart === 0) return "aujourd'hui";
  if (ecart === 1) return "demain";
  if (ecart === -1) return "hier";
  if (ecart < 0) return `il y a ${-ecart} j`;
  if (ecart < 60) return `dans ${ecart} j`;
  return `dans ${Math.round(ecart / 30)} mois`;
}
