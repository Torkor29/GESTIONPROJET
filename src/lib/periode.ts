import { debutDeMois, debutDeSemaine, depuisChampDate } from "./format";

export type Periode = {
  cle: string;
  libelle: string;
  du: number | null;
  au: number | null;
};

const JOUR = 86400;

/**
 * Traduit les paramètres d'URL en intervalle de dates.
 * `au` est exclusif : il pointe sur le lendemain à minuit.
 */
export function resoudrePeriode(params: {
  periode?: string;
  du?: string;
  au?: string;
}): Periode {
  const maintenant = Math.floor(Date.now() / 1000);
  const cle = params.periode ?? "mois";

  if (cle === "perso") {
    const du = depuisChampDate(params.du ?? "");
    const auSaisi = depuisChampDate(params.au ?? "");
    return {
      cle,
      libelle: "Période personnalisée",
      du,
      au: auSaisi ? auSaisi + JOUR : null,
    };
  }

  switch (cle) {
    case "semaine":
      return { cle, libelle: "Cette semaine", du: debutDeSemaine(maintenant), au: null };
    case "semaine_derniere": {
      const debut = debutDeSemaine(maintenant) - 7 * JOUR;
      return { cle, libelle: "Semaine dernière", du: debut, au: debut + 7 * JOUR };
    }
    case "mois_dernier": {
      const d = new Date(maintenant * 1000);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      const finMoisDernier = Math.floor(d.getTime() / 1000);
      d.setMonth(d.getMonth() - 1);
      return {
        cle,
        libelle: "Mois dernier",
        du: Math.floor(d.getTime() / 1000),
        au: finMoisDernier,
      };
    }
    case "tout":
      return { cle, libelle: "Tout l'historique", du: null, au: null };
    default:
      return { cle: "mois", libelle: "Ce mois-ci", du: debutDeMois(maintenant), au: null };
  }
}

export const CHOIX_PERIODE = [
  { cle: "semaine", libelle: "Cette semaine" },
  { cle: "semaine_derniere", libelle: "Semaine dernière" },
  { cle: "mois", libelle: "Ce mois-ci" },
  { cle: "mois_dernier", libelle: "Mois dernier" },
  { cle: "tout", libelle: "Tout" },
  { cle: "perso", libelle: "Personnalisée" },
] as const;
