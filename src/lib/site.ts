/**
 * Identité publique de l'outil, et adresse du site.
 *
 * `DOMAINE` est déjà la variable qui pilote Caddy et le cookie de session ;
 * on la réutilise plutôt que d'en introduire une seconde qui pourrait la
 * contredire. Sans domaine configuré, on retombe sur l'adresse locale : les
 * liens absolus du plan du site restent alors cohérents en développement.
 */

export const SITE_URL = process.env.DOMAINE
  ? `https://${process.env.DOMAINE}`
  : "http://localhost:3000";

/** Nom affiché partout où l'on présente le produit. */
export const NOM_PRODUIT = "Vigie Clinique";

/** Forme courte, pour les espaces serrés (barre latérale, pastille). */
export const NOM_COURT = "Vigie";

export const ACCROCHE =
  "L'espace de travail des équipes de recherche clinique";

export const DESCRIPTION_COURTE =
  "Vigie Clinique est l'espace de travail des professionnels de la recherche clinique : un même endroit pour suivre les études, les missions, les documents et l'activité de chacun.";

export const DESCRIPTION_SEO =
  "Vigie Clinique est l'espace de travail des équipes de recherche clinique. Centralisez le suivi des études, des missions, des documents et des obligations — un outil métier pour les ARC, les TEC et les chefs de projet.";

export type LienPublic = {
  href: string;
  libelle: string;
  /** Libellé plus précis, pour le pied de page ou le plan du site. */
  libelleLong?: string;
};

export const LIENS_PUBLICS: LienPublic[] = [
  { href: "/", libelle: "Accueil" },
  { href: "/reglementaire", libelle: "Référentiels", libelleLong: "Référentiels réglementaires" },
  { href: "/donnees", libelle: "Sécurité", libelleLong: "Confidentialité et hébergement" },
  { href: "/mentions-legales", libelle: "Mentions légales" },
];
