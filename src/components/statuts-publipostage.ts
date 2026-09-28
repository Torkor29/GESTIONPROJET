/**
 * Couleurs du circuit d'un document de publipostage. Partagées entre le
 * tableau de suivi et la page d'un document, pour qu'un statut se lise
 * pareil partout.
 */

export const COULEURS_PUBLIPOSTAGE: Record<string, string> = {
  brouillon: "text-attenue",
  pret: "text-info",
  envoye_coordo: "text-attention",
  corrections: "text-alerte",
  valide: "text-reussite",
  signe: "text-reussite",
  annule: "text-efface",
};

export const PASTILLES_PUBLIPOSTAGE: Record<string, string> = {
  brouillon: "bg-efface",
  pret: "bg-info",
  envoye_coordo: "bg-attention",
  corrections: "bg-alerte",
  valide: "bg-reussite",
  signe: "bg-reussite",
  annule: "bg-ligne-forte",
};

/** Au-delà, un document resté chez le coordonnateur mérite une relance. */
export const JOURS_AVANT_RELANCE = 15;
