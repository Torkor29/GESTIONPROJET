import type { ModelePublipostage, Valeurs } from "./publipostage";

/**
 * Les trames disponibles au publipostage.
 *
 * Chaque champ correspond à une balise `{{cle}}` posée dans le .docx du
 * dossier `modeles/`. Les libellés des options doivent rester identiques à
 * ceux des balises de cases à cocher (`{{categorie=RIPH1}}`) : c'est par eux
 * que la case se coche. `npm run modeles:verifier` contrôle cette cohérence.
 */

const OUI_NON = ["Oui", "Non"];

/* -------------------------------------------------------------------------- */
/*  Convention centre associé — ENR-02228 V4                                  */
/* -------------------------------------------------------------------------- */

/** Libellé de l'article 2, calqué mot pour mot sur les lignes de la trame. */
const QUALIFICATIONS: Record<string, string> = {
  RIPH1:
    "de recherche interventionnelle, au sens de l’article L. 1121-1 du Code de la santé publique (catégorie 1)",
  RIPH2:
    "de recherche interventionnelle à risques et contraintes minimes, au sens de l’article L. 1121-1 du Code de la santé publique (catégorie 2)",
  RIPH3:
    "de recherche non interventionnelle, au sens de l'article L. 1121-1 du Code de la santé publique (catégorie 3)",
  "Essai clinique (EC)": "d'essai clinique au sens du Règlement EC",
  "Investigation clinique (IC)":
    "d'investigation clinique au sens du Règlement DM (à l’exclusion des cas 4.1 et 4.2 tels que définis par l’ANSM)",
  "Étude des performances (EP)": "d'étude des performances au sens du Règlement DM-DIV",
};

const TEXTES_VISES = {
  ec: "Règlement EC (536/2014)",
  dm: "Règlement DM (2017/745)",
  div: "Règlement DM-DIV (2017/746)",
  riph: "Loi RIPH (2012-300)",
} as const;

/**
 * Mention « (Non applicable) » d'un texte visé. Tant que la question n'a pas
 * reçu de réponse, la trame garde sa mention d'origine, surlignée.
 */
function visa(texte: string) {
  return (v: Valeurs) => {
    const retenus = v.textes_applicables;
    if (!Array.isArray(retenus) || retenus.length === 0) return undefined;
    return retenus.includes(texte) ? "" : " (Non applicable)";
  };
}

const CONVENTION: ModelePublipostage = {
  cle: "convention_centre_associe",
  nom: "Convention centre associé",
  reference: "ENR-02228 V4",
  description:
    "Convention de participation d'un centre associé à une recherche promue par le CHU de Brest.",
  fichier: "convention-centre-associe.docx",
  champsTitre: ["acronyme", "centre_nom"],
  sections: [
    {
      titre: "Étude",
      champs: [
        {
          cle: "reference_etude",
          libelle: "Référence de l'étude (REF.)",
          type: "texte",
          exemple: "29BRC24.0123",
        },
        { cle: "acronyme", libelle: "Acronyme", type: "texte", depuisEtude: "code" },
        {
          cle: "titre_recherche",
          libelle: "Titre de la recherche",
          type: "texte_long",
          depuisEtude: "nom",
        },
        {
          cle: "investigateur_coordonnateur",
          libelle: "Investigateur coordonnateur",
          type: "texte",
          depuisEtude: "investigateur",
        },
        {
          cle: "categorie",
          libelle: "Catégorie de la recherche",
          type: "choix",
          options: [
            "RIPH1",
            "RIPH2",
            "Essai clinique (EC)",
            "Investigation clinique (IC)",
            "Étude des performances (EP)",
            "RIPH3",
            "Autre",
          ],
          aide: "Coche la case du tableau et écrit la qualification de l'article 2. Les RNIPH sont exclues.",
          large: true,
        },
        {
          cle: "categorie_autre",
          libelle: "Si « Autre » : préciser",
          type: "texte",
          facultatif: true,
          large: true,
        },
        {
          cle: "textes_applicables",
          libelle: "Textes visés qui s'appliquent",
          type: "cases",
          options: Object.values(TEXTES_VISES),
          aide: "Les textes non cochés porteront la mention « (Non applicable) » dans le préambule. Pour mémoire : EC → Règlement EC, IC → Règlement DM, EP → Règlement DM-DIV, RIPH → loi RIPH.",
        },
        {
          cle: "financement",
          libelle: "Origine du financement",
          type: "choix",
          options: ["AAP", "Interne au promoteur", "Industriel"],
        },
        {
          cle: "financement_aap",
          libelle: "Si AAP : type et année d'obtention",
          type: "texte",
          exemple: "DGOS, PHRC, 2022",
          facultatif: true,
        },
        { cle: "duree_mois", libelle: "Durée prévisionnelle (mois)", type: "nombre" },
        { cle: "nombre_patients", libelle: "Inclusions prévues au total (patients)", type: "nombre" },
        {
          cle: "assurance",
          libelle: "Assurance",
          type: "choix",
          options: ["Police souscrite", "Non applicable"],
        },
        { cle: "assureur", libelle: "Assureur", type: "texte", facultatif: true },
        { cle: "numero_police", libelle: "N° de police", type: "texte", facultatif: true },
        {
          cle: "numero_eudract_idrcb",
          libelle: "N° EudraCT / ID-RCB",
          type: "texte",
          depuisEtude: "idRcb",
        },
        {
          cle: "methodologie",
          libelle: "Méthodologie de référence",
          type: "choix",
          options: ["MR001", "MR002", "MR003"],
          facultatif: true,
        },
        {
          cle: "numero_clinicaltrials",
          libelle: "N° ClinicalTrials.gov",
          type: "texte",
          exemple: "NCT01234567",
          facultatif: true,
        },
      ],
    },
    {
      titre: "Centre associé",
      champs: [
        {
          cle: "centre_nom",
          libelle: "Établissement",
          type: "texte",
          exemple: "Centre Hospitalier de Quimper",
          large: true,
        },
        { cle: "centre_finess", libelle: "N° FINESS", type: "texte", exemple: "290 000 000" },
        { cle: "centre_siret", libelle: "N° SIRET", type: "texte", exemple: "262 900 000 00000" },
        { cle: "centre_adresse", libelle: "Siège social", type: "texte", large: true },
        {
          cle: "centre_directeur",
          libelle: "Directeur général (qui représente le centre)",
          type: "texte",
          exemple: "Monsieur Jean DUPONT",
          large: true,
        },
        {
          cle: "lieu_recherche",
          libelle: "Lieu de recherche",
          type: "texte",
          aide: "Site ou hôpital où se déroule la recherche dans le centre.",
        },
        { cle: "service", libelle: "Service de…", type: "texte", exemple: "Cardiologie" },
        { cle: "investigateur_principal", libelle: "Investigateur principal", type: "texte" },
        { cle: "inclusions_patients", libelle: "Inclusions prévues dans le centre (patients)", type: "nombre" },
        {
          cle: "inclusions_volontaires",
          libelle: "Inclusions prévues dans le centre (volontaires sains)",
          type: "nombre",
          exemple: "0",
        },
      ],
    },
    {
      titre: "Conditions financières",
      champs: [
        {
          cle: "centre_rib",
          libelle: "RIB du centre associé",
          type: "texte_long",
          exemple: "Titulaire, IBAN, BIC, domiciliation",
        },
        {
          cle: "contact_financier_promoteur",
          libelle: "Contact mail gestion financière — promoteur",
          type: "texte",
        },
        {
          cle: "contact_financier_centre",
          libelle: "Contact mail gestion financière — centre associé",
          type: "texte",
        },
      ],
    },
    {
      titre: "Produits de santé",
      description: "À renseigner s'il y a lieu (article 3.2).",
      champs: [
        {
          cle: "produits_type",
          libelle: "Produits fournis",
          type: "choix",
          options: ["Médicaments", "Dispositifs Médicaux", "Médicaments et Dispositifs Médicaux"],
          facultatif: true,
        },
        {
          cle: "produits_noms",
          libelle: "Nom des médicaments ou dispositifs médicaux",
          type: "texte",
          facultatif: true,
          large: true,
        },
        {
          cle: "pharmacie_adresse",
          libelle: "Adresse de la pharmacie du centre",
          type: "texte_long",
          facultatif: true,
        },
        {
          cle: "produits_devenir",
          libelle: "En fin de recherche, les produits inutilisés sont",
          type: "choix",
          options: ["à détruire", "à renvoyer à la pharmacie à usage intérieur"],
          facultatif: true,
        },
      ],
    },
    {
      titre: "Protection des données (annexe 2)",
      champs: [
        {
          cle: "centre_dpd",
          libelle: "Coordonnées du DPD du centre associé",
          type: "texte",
          large: true,
        },
        {
          cle: "stu_entite",
          libelle: "Sous-traitant ultérieur autorisé",
          type: "texte",
          aide: "Laisser vide pour « NA ».",
          facultatif: true,
        },
        {
          cle: "stu_activites",
          libelle: "Activités confiées au sous-traitant ultérieur",
          type: "texte",
          aide: "Laisser vide pour « NA ».",
          facultatif: true,
        },
      ],
    },
  ],
  calcules: {
    qualification_recherche: (v) => {
      const categorie = typeof v.categorie === "string" ? v.categorie : "";
      if (categorie === "Autre") {
        return typeof v.categorie_autre === "string" && v.categorie_autre.trim()
          ? v.categorie_autre.trim()
          : undefined;
      }
      return QUALIFICATIONS[categorie];
    },
    visa_ec: visa(TEXTES_VISES.ec),
    visa_dm: visa(TEXTES_VISES.dm),
    visa_div: visa(TEXTES_VISES.div),
    visa_riph: visa(TEXTES_VISES.riph),
    assurance_mention: (v) => {
      if (v.assurance === "Non applicable") return "(Non applicable)";
      return v.assurance === "Police souscrite" ? "" : undefined;
    },
  },
};

/* -------------------------------------------------------------------------- */
/*  Fiche de qualification de projet — 05505 V6.0                             */
/* -------------------------------------------------------------------------- */

const FICHE_QUALIFICATION: ModelePublipostage = {
  cle: "fiche_qualification",
  nom: "Fiche de qualification de projet",
  reference: "05505 V6.0",
  description:
    "Fiche de renseignements en vue de la qualification d'un projet de recherche clinique, à adresser à promotion-interne@chu-brest.fr.",
  fichier: "fiche-qualification-projet.docx",
  champsTitre: ["acronyme", "porteur_nom"],
  sections: [
    {
      titre: "Porteur du projet",
      champs: [
        { cle: "porteur_nom", libelle: "Nom du porteur", type: "texte" },
        {
          cle: "porteur_coordonnees",
          libelle: "Mail et n° de téléphone",
          type: "texte",
          exemple: "prenom.nom@chu-brest.fr — 02 98 00 00 00",
        },
        {
          cle: "porteur_qualification",
          libelle: "Qualification du porteur",
          type: "texte",
          exemple: "Interne, kinésithérapeute, PH, PU-PH…",
        },
        {
          cle: "encadrant_nom",
          libelle: "Nom de l'encadrant (si étudiant)",
          type: "texte",
          facultatif: true,
        },
        {
          cle: "methodologiste_nom",
          libelle: "Méthodologiste / statisticien (si connu)",
          type: "texte",
          facultatif: true,
        },
        { cle: "etablissement", libelle: "Établissement", type: "texte" },
        { cle: "specialite", libelle: "Spécialité médicale", type: "texte" },
        { cle: "date_remplissage", libelle: "Date de remplissage", type: "date" },
      ],
    },
    {
      titre: "Méthodologie",
      champs: [
        {
          cle: "analyses_par",
          libelle: "Analyses statistiques réalisées par",
          type: "choix",
          options: ["DRCI", "Autre"],
        },
        {
          cle: "analyses_par_autre",
          libelle: "Si « Autre » : préciser",
          type: "texte",
          facultatif: true,
        },
        { cle: "methodo_validee", libelle: "Méthodologie validée", type: "choix", options: ["Non", "Oui"] },
        {
          cle: "methodo_validee_par",
          libelle: "Si oui, validée par",
          type: "choix",
          options: ["Centre de Ressources Méthodologiques (CRM)", "Autre"],
          facultatif: true,
        },
        {
          cle: "methodo_validee_autre",
          libelle: "Si validée par un autre : préciser",
          type: "texte",
          facultatif: true,
        },
        {
          cle: "temps_disponible",
          libelle: "Temps disponible pour réaliser la recherche",
          type: "choix",
          options: ["Moins de 1 an", "Plus de 1 an"],
        },
        {
          cle: "publication",
          libelle: "Publication dans une revue à comité de lecture (rang A, B ou C)",
          type: "choix",
          options: OUI_NON,
        },
        {
          cle: "publication_justification",
          libelle: "Si non : justifier",
          type: "texte",
          facultatif: true,
        },
      ],
    },
    {
      titre: "Le projet",
      champs: [
        { cle: "titre", libelle: "Titre", type: "texte_long", depuisEtude: "nom" },
        { cle: "acronyme", libelle: "Acronyme", type: "texte", depuisEtude: "code" },
        {
          cle: "descriptif",
          libelle: "Contexte et déroulement de l'étude",
          type: "texte_long",
          aide: "Visites, actes et procédures…",
          depuisEtude: "description",
        },
        { cle: "objectif_principal", libelle: "Objectif principal", type: "texte_long" },
        {
          cle: "finalite",
          libelle:
            "Améliorer les pratiques ou la prise en charge dans le service, ou produire une connaissance générale ?",
          type: "texte_long",
        },
        { cle: "randomisation", libelle: "Randomisation (tirage au sort)", type: "choix", options: OUI_NON },
      ],
    },
    {
      titre: "Données utilisées",
      champs: [
        {
          cle: "type_donnees",
          libelle: "Pour votre recherche, vous allez utiliser",
          type: "choix",
          options: [
            "Données existantes (rétrospectives)",
            "Données prospectives (pratiques, satisfaction)",
            "Données prospectives sans actes supplémentaires",
            "Données prospectives avec actes supplémentaires",
          ],
          aide: "Une seule réponse. « Pratiques, satisfaction » : l'étude n'apporte pas de connaissance biologique ou médicale nouvelle.",
          large: true,
        },
        {
          cle: "retro_profondeur",
          libelle: "Rétrospectif : profondeur des données",
          type: "texte",
          exemple: "Du 01/01/2021 au 31/12/2024",
          facultatif: true,
        },
        {
          cle: "retro_ticket_eds",
          libelle: "Rétrospectif : ticket de l'entrepôt de données de santé",
          type: "texte",
          exemple: "PDS-1234",
          facultatif: true,
        },
        {
          cle: "actes_supplementaires",
          libelle: "Avec actes supplémentaires : lesquels",
          type: "texte_long",
          facultatif: true,
        },
        {
          cle: "produits_conformes",
          libelle: "Produits de santé utilisés conformément à leur AMM ou marquage CE, dans l'indication",
          type: "choix",
          options: OUI_NON,
          facultatif: true,
        },
        {
          cle: "produits_conformes_precision",
          libelle: "Si non : préciser",
          type: "texte",
          facultatif: true,
        },
        {
          cle: "lieu",
          libelle: "Où se déroulera la recherche",
          type: "choix",
          options: [
            "Un seul service de mon établissement",
            "Plusieurs services de mon établissement",
            "Plusieurs établissements",
          ],
          large: true,
        },
        {
          cle: "codage_donnees",
          libelle: "Les données seront recueillies",
          type: "choix",
          options: [
            "Codées (code patient et table de correspondance)",
            "Anonymes (ni code ni table de correspondance)",
          ],
          large: true,
        },
        {
          cle: "points_particuliers",
          libelle: "La recherche correspond-elle à l'un de ces points ?",
          type: "cases",
          options: [
            "Information impossible d'une partie des patients",
            "Données nominatives",
            "Recherche en génétique (identification des individus)",
            "Appariement avec des bases médico-administratives",
            "Étude portant sur la vigilance",
            "Aucun de ces cas",
          ],
        },
      ],
    },
    {
      titre: "Conclusions de la DRCI",
      description: "Partie remplie par la DRCI — à compléter si c'est vous qui la tenez.",
      champs: [
        { cle: "drci_date", libelle: "Date", type: "date", facultatif: true },
        {
          cle: "drci_presents",
          libelle: "Personnes présentes",
          type: "cases",
          options: ["SG", "RV", "AC", "MLB"],
          facultatif: true,
        },
        {
          cle: "drci_qualification",
          libelle: "Qualification",
          type: "choix",
          options: [
            "Essai clinique Médicament",
            "RIPH de Catégorie 2",
            "Investigation clinique (DM)",
            "RIPH de Catégorie 3",
            "RIPH de Catégorie 1 HPS",
            "Hors RIPH conforme MR004",
            "Recherche interne",
            "Autre recherche sur données",
          ],
          facultatif: true,
          large: true,
        },
        {
          cle: "drci_interlocuteur",
          libelle: "Interlocuteur DRCI",
          type: "choix",
          options: ["promotion-interne@chu-brest.fr", "cellule.rniph@chu-brest.fr"],
          facultatif: true,
          large: true,
        },
        {
          cle: "drci_circuit",
          libelle: "Circuit interne",
          type: "cases",
          options: ["Plateforme méthodologique CHU", "Passage en BTPR"],
          facultatif: true,
        },
        {
          cle: "btpr_motif",
          libelle: "Passage en BTPR",
          type: "choix",
          options: ["Pour information", "Pour validation"],
          facultatif: true,
        },
        {
          cle: "btpr_presentation_par",
          libelle: "Présentation du dossier par",
          type: "texte",
          exemple: "le porteur",
          facultatif: true,
        },
        { cle: "btpr_date", libelle: "Date prévue de passage BTPR", type: "date", facultatif: true },
        {
          cle: "drci_reglementaire",
          libelle: "Réglementaire",
          type: "cases",
          options: [
            "Aucune",
            "Autorisation CNIL",
            "Comité d'éthique de l'établissement",
            "CPP tiré au sort",
            "ANSM",
          ],
          facultatif: true,
        },
        {
          cle: "drci_preconisations",
          libelle: "Préconisations / arguments de la qualification",
          type: "texte_long",
          facultatif: true,
        },
      ],
    },
  ],
};

export const MODELES_PUBLIPOSTAGE: ModelePublipostage[] = [CONVENTION, FICHE_QUALIFICATION];
