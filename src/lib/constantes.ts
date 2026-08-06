/** Libellés partagés entre le serveur et le navigateur. */

/**
 * Longueur minimale d'un mot de passe. Vit ici plutôt que dans `lib/auth`
 * parce que le formulaire d'inscription, qui tourne dans le navigateur, ne
 * peut pas importer un module touchant à la base ni à `node:crypto`.
 */
export const LONGUEUR_MOT_DE_PASSE = 10;

/** Métiers proposés à l'inscription. Détermine les modules suggérés. */
export const LIBELLES_ROLE: Record<string, string> = {
  arc: "Attaché de recherche clinique",
  tec: "Technicien d'étude clinique",
  cp: "Chef de projet",
  autre: "Autre",
};

/** Catégories de documents, calquées sur le contenu réel d'un TMF. */
export const CATEGORIES_DOCUMENT: Record<string, string> = {
  protocole: "Protocole et amendements",
  brochure: "Brochure investigateur",
  information_consentement: "Note d'information et consentement",
  avis_cpp: "Avis du CPP",
  autorisation_ansm: "Autorisation / information ANSM",
  cnil: "Conformité CNIL et RGPD",
  assurance: "Assurance",
  convention: "Conventions et contrats",
  budget: "Budget et facturation",
  crf: "Cahier d'observation et gestion des données",
  statistiques: "Plan d'analyse statistique",
  monitoring: "Monitoring et contrôle qualité",
  securite: "Vigilance et sécurité",
  equipe: "CV, formations et délégations",
  produit: "Circuit produit ou dispositif",
  rapport: "Rapports et résultats",
  correspondance: "Correspondance",
  autre: "Autre",
};

/** Ordre d'affichage des catégories de documents. */
export const ORDRE_CATEGORIES_DOCUMENT = Object.keys(CATEGORIES_DOCUMENT);

/** Catégories de la base de connaissance. */
export const CATEGORIES_FAQ: Record<string, string> = {
  general: "Général",
  reglementaire: "Réglementaire",
  cpp_ansm: "CPP et ANSM",
  rgpd: "RGPD et données",
  vigilance: "Vigilance et sécurité",
  monitoring: "Monitoring",
  donnees: "Gestion des données",
  contrats: "Contrats et budget",
  logistique: "Logistique et centres",
  archivage: "Archivage",
};

export const LIBELLES_STATUT_MISSION: Record<string, string> = {
  a_faire: "Non démarrée",
  en_cours: "En cours",
  terminee: "Terminée",
};

export function octetsLisibles(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} Ko`;
  return `${(octets / 1024 / 1024).toFixed(1)} Mo`;
}

/** Types de visite de monitorage, dans l'ordre chronologique d'une étude. */
export const TYPES_VISITE: Record<string, string> = {
  mise_en_place: "Mise en place",
  routine: "Visite de routine",
  a_distance: "Visite à distance",
  declenchee: "Visite déclenchée",
  cloture: "Visite de clôture",
};

/** Étapes d'une visite, de la planification à la clôture. */
export const STATUTS_VISITE: Record<string, string> = {
  planifiee: "Planifiée",
  realisee: "Réalisée",
  rapport_redige: "Rapport rédigé",
  lettre_envoyee: "Lettre envoyée",
  cloturee: "Clôturée",
  annulee: "Annulée",
};

/** Une visite est considérée en cours tant qu'elle n'est ni close ni annulée. */
export const STATUTS_VISITE_OUVERTS = [
  "planifiee",
  "realisee",
  "rapport_redige",
  "lettre_envoyee",
];

/** Nature d'un écart, calquée sur les rubriques d'un rapport de monitorage. */
export const CATEGORIES_ECART: Record<string, string> = {
  protocole: "Protocole",
  consentement: "Consentement",
  produit: "Produit / dispositif",
  donnees: "Données et CRF",
  procedure: "Procédure interne",
  autre: "Autre",
};

/** Gravité d'un écart. Détermine l'urgence des suites à donner. */
export const GRAVITES_ECART: Record<string, string> = {
  mineur: "Mineur",
  majeur: "Majeur",
  critique: "Critique",
};

export const STATUTS_ECART: Record<string, string> = {
  ouvert: "Ouvert",
  en_cours: "En cours de traitement",
  clos: "Clos",
};

/** Une action est corrective quand l'écart existe, préventive quand on l'anticipe. */
export const NATURES_ACTION: Record<string, string> = {
  corrective: "Corrective",
  preventive: "Préventive",
};

/**
 * Étapes d'une action. « Faite » ne suffit pas à clore : on vérifie ensuite
 * qu'elle produit l'effet attendu, d'où l'étape « vérifiée ».
 */
export const STATUTS_ACTION: Record<string, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  faite: "Faite",
  verifiee: "Vérifiée",
  abandonnee: "Abandonnée",
};

/** Une action reste à traiter tant qu'elle n'est ni vérifiée ni abandonnée. */
export const STATUTS_ACTION_OUVERTS = ["a_faire", "en_cours", "faite"];

/** Types de document contractuel rattaché à une étude. */
export const TYPES_CONVENTION: Record<string, string> = {
  convention: "Convention",
  avenant: "Avenant",
  cta: "Contrat unique / CTA",
  autre: "Autre contrat",
};

/** Cycle de vie d'une convention, de la négociation au solde. */
export const STATUTS_CONVENTION: Record<string, string> = {
  en_negociation: "En négociation",
  signee: "Signée",
  en_cours: "Facturation en cours",
  soldee: "Soldée",
  annulee: "Annulée",
};

/** Une convention reste à suivre tant qu'elle n'est ni soldée ni annulée. */
export const STATUTS_CONVENTION_OUVERTS = ["en_negociation", "signee", "en_cours"];
