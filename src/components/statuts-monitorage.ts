/**
 * Couleurs de statut des modules de monitorage.
 *
 * Rassemblées ici parce que trois tableaux les emploient : les garder à côté
 * de chaque tableau ferait diverger les teintes au fil des retouches.
 */

/** Une visite progresse ; la couleur suit l'avancement, pas un bon/mauvais. */
export const COULEURS_VISITE: Record<string, string> = {
  planifiee: "text-attenue",
  realisee: "text-info",
  rapport_redige: "text-info",
  lettre_envoyee: "text-info",
  cloturee: "text-reussite",
  annulee: "text-efface",
};

export const PASTILLES_VISITE: Record<string, string> = {
  planifiee: "bg-efface",
  realisee: "bg-info",
  rapport_redige: "bg-info",
  lettre_envoyee: "bg-info",
  cloturee: "bg-reussite",
  annulee: "bg-ligne-forte",
};

/** Un écart ouvert appelle une action : il reste en alerte jusqu'à sa clôture. */
export const COULEURS_ECART: Record<string, string> = {
  ouvert: "text-alerte",
  en_cours: "text-attention",
  clos: "text-reussite",
};

export const PASTILLES_ECART: Record<string, string> = {
  ouvert: "bg-alerte",
  en_cours: "bg-attention",
  clos: "bg-reussite",
};

/**
 * Une action « faite » reste en attente : elle n'est verte qu'une fois son
 * efficacité vérifiée. La couleur le dit avant qu'on lise le libellé.
 */
export const COULEURS_ACTION: Record<string, string> = {
  a_faire: "text-alerte",
  en_cours: "text-attention",
  faite: "text-info",
  verifiee: "text-reussite",
  abandonnee: "text-efface",
};

export const PASTILLES_ACTION: Record<string, string> = {
  a_faire: "bg-alerte",
  en_cours: "bg-attention",
  faite: "bg-info",
  verifiee: "bg-reussite",
  abandonnee: "bg-ligne-forte",
};
