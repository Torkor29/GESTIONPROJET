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
