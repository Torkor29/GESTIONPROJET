/**
 * Référentiels réglementaires pour la recherche clinique.
 *
 * ⚠️ Ces checklists sont une aide au travail, pas un avis réglementaire.
 * Les textes évoluent : vérifiez toujours la version en vigueur auprès de
 * l'ANSM, du CPP, de la CNIL ou de l'EMA avant de vous engager. Chaque
 * référentiel porte la date à laquelle son contenu a été vérifié.
 *
 * Dernière vérification des sources : 4 août 2026.
 */

export type Phase = "conception" | "soumission" | "mise_en_place" | "conduite" | "cloture";

export const LIBELLES_PHASE: Record<Phase, string> = {
  conception: "Conception et préparation",
  soumission: "Soumission réglementaire",
  mise_en_place: "Mise en place",
  conduite: "Conduite de l'étude",
  cloture: "Clôture et archivage",
};

export const ORDRE_PHASES: Phase[] = [
  "conception",
  "soumission",
  "mise_en_place",
  "conduite",
  "cloture",
];

export type ItemReferentiel = {
  cle: string;
  titre: string;
  description?: string;
  /** Texte réglementaire ou source précise. */
  reference?: string;
  phase: Phase;
  /** Faux pour une bonne pratique recommandée mais non imposée. */
  obligatoire?: boolean;
};

export type Referentiel = {
  cle: string;
  nom: string;
  resume: string;
  /** « type » : on en coche en principe un seul. « transversal » : cumulables. */
  categorie: "type" | "transversal";
  sources: { libelle: string; url: string }[];
  verifieLe: string;
  items: ItemReferentiel[];
};

const AVERTISSEMENT =
  "Aide au travail, pas un avis réglementaire. Vérifiez la version en vigueur des textes " +
  "auprès des autorités compétentes avant toute décision.";

// ---------------------------------------------------------------- RIPH 1

const RIPH1: Referentiel = {
  cle: "riph1",
  nom: "RIPH catégorie 1 — recherche interventionnelle",
  resume:
    "Recherche interventionnelle comportant une intervention non justifiée par la prise en " +
    "charge habituelle. Avis favorable du CPP ET autorisation de l'ANSM requis.",
  categorie: "type",
  verifieLe: "2026-08-04",
  sources: [
    { libelle: "ANSM — démarches chercheur", url: "https://ansm.sante.fr/vos-demarches/chercheur" },
    {
      libelle: "Code de la santé publique, art. L.1121-1 et suivants",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072665/LEGISCTA000006171559/",
    },
  ],
  items: [
    {
      cle: "categorie",
      titre: "Confirmer la catégorie RIPH et documenter le raisonnement",
      description:
        "La qualification (1, 2, 3 ou hors RIPH) conditionne tout le circuit. Écrivez noir sur " +
        "blanc pourquoi vous retenez cette catégorie : c'est la première question posée en cas " +
        "de contrôle, et la première chose que le CPP challenge.",
      reference: "Art. L.1121-1 CSP",
      phase: "conception",
    },
    {
      cle: "promoteur",
      titre: "Désigner le promoteur et vérifier sa capacité à assumer ce rôle",
      reference: "Art. L.1121-1 CSP",
      phase: "conception",
    },
    {
      cle: "protocole",
      titre: "Rédiger le protocole, le synopsis et la justification du rapport bénéfice/risque",
      phase: "conception",
    },
    {
      cle: "assurance",
      titre: "Souscrire l'assurance de responsabilité civile du promoteur",
      description:
        "Obligatoire pour les recherches interventionnelles. L'attestation est exigée au dossier " +
        "CPP : anticipez le délai d'obtention auprès de l'assureur.",
      reference: "Art. L.1121-10 CSP",
      phase: "conception",
    },
    {
      cle: "id_rcb",
      titre: "Obtenir le numéro ID-RCB",
      description: "Identifiant unique de la recherche, à demander avant toute soumission.",
      phase: "conception",
    },
    {
      cle: "consentement_doc",
      titre: "Rédiger la note d'information et le formulaire de consentement éclairé",
      description:
        "Vérifiez la lisibilité : le CPP renvoie très souvent le dossier sur ce point. Prévoyez " +
        "les versions spécifiques (mineurs, majeurs protégés, urgence) si applicable.",
      reference: "Art. L.1122-1 et L.1122-1-1 CSP",
      phase: "conception",
    },
    {
      cle: "budget",
      titre: "Établir le budget, les surcoûts hospitaliers et le circuit de facturation",
      phase: "conception",
      obligatoire: false,
    },
    {
      cle: "cpp_tirage",
      titre: "Déposer le dossier sur SI-RIPH pour le tirage au sort du CPP",
      description: "Le CPP est tiré au sort par la CNRIPH, il ne se choisit pas.",
      phase: "soumission",
    },
    {
      cle: "ansm_autorisation",
      titre: "Soumettre la demande d'autorisation à l'ANSM",
      description:
        "Spécifique à la catégorie 1 : l'ANSM délivre une autorisation, là où les catégories 2 " +
        "et 3 se limitent à une information.",
      reference: "Art. L.1123-8 CSP",
      phase: "soumission",
    },
    {
      cle: "reponses",
      titre: "Répondre aux questions du CPP et de l'ANSM dans les délais impartis",
      description:
        "Les délais de réponse sont contraints et leur dépassement peut rendre la demande " +
        "caduque. Mettez une alerte dès réception des questions.",
      phase: "soumission",
    },
    {
      cle: "avis_favorable",
      titre: "Obtenir l'avis favorable du CPP et l'autorisation ANSM avant tout acte de recherche",
      description:
        "Aucun acte spécifique à la recherche ne peut débuter avant. C'est le point de contrôle " +
        "le plus lourd de conséquences.",
      phase: "soumission",
    },
    {
      cle: "cnil",
      titre: "Déclarer la conformité à la méthodologie de référence CNIL applicable",
      description: "Voir le référentiel « RGPD et CNIL » pour le détail.",
      phase: "soumission",
    },
    {
      cle: "enregistrement",
      titre: "Enregistrer l'étude dans un registre public d'essais cliniques",
      description:
        "Exigé par la plupart des revues à comité de lecture avant la première inclusion.",
      phase: "soumission",
      obligatoire: false,
    },
    {
      cle: "conventions",
      titre: "Signer les conventions avec les centres investigateurs",
      description: "Convention unique pour les établissements de santé, le cas échéant.",
      phase: "mise_en_place",
    },
    {
      cle: "equipe",
      titre: "Vérifier les CV, les formations BPC et le registre de délégation des tâches",
      phase: "mise_en_place",
    },
    {
      cle: "mise_en_place_reunion",
      titre: "Organiser la réunion de mise en place et former les équipes au protocole",
      phase: "mise_en_place",
    },
    {
      cle: "crf",
      titre: "Mettre en service le cahier d'observation et le plan de gestion des données",
      phase: "mise_en_place",
    },
    {
      cle: "classeurs",
      titre: "Ouvrir le classeur investigateur (ISF) et le TMF promoteur",
      description:
        "Ouvrez-les au démarrage, pas à la clôture : un TMF reconstitué a posteriori est " +
        "immédiatement visible en inspection.",
      phase: "mise_en_place",
    },
    {
      cle: "consentement_recueil",
      titre: "Vérifier le recueil du consentement avant tout acte spécifique à la recherche",
      description:
        "Point n°1 des écarts relevés en inspection : date de consentement postérieure à un acte " +
        "de recherche, ou version périmée du formulaire signée.",
      reference: "Art. L.1122-1-1 CSP",
      phase: "conduite",
    },
    {
      cle: "eig",
      titre: "Déclarer les événements indésirables graves selon le circuit et les délais prévus",
      reference: "Art. R.1123-46 et suivants CSP",
      phase: "conduite",
    },
    {
      cle: "modifications",
      titre: "Soumettre les modifications substantielles au CPP et à l'ANSM",
      description: "Aucune modification substantielle ne s'applique avant avis et autorisation.",
      phase: "conduite",
    },
    {
      cle: "rapport_securite",
      titre: "Transmettre le rapport annuel de sécurité",
      phase: "conduite",
    },
    {
      cle: "monitoring",
      titre: "Réaliser le monitoring selon le plan basé sur les risques",
      phase: "conduite",
    },
    {
      cle: "fin_declaration",
      titre: "Déclarer la fin de la recherche au CPP et à l'ANSM",
      description:
        "Délai usuel de 90 jours après la fin de la recherche, ramené à 15 jours en cas d'arrêt " +
        "anticipé. Confirmez les délais applicables à votre situation.",
      reference: "Art. R.1123-60 CSP",
      phase: "cloture",
    },
    {
      cle: "rapport_final",
      titre: "Rédiger le rapport final et transmettre le résumé des résultats",
      description: "Résumé attendu dans l'année suivant la fin de la recherche.",
      phase: "cloture",
    },
    {
      cle: "information_participants",
      titre: "Informer les participants des résultats globaux de la recherche",
      reference: "Art. L.1122-1 CSP",
      phase: "cloture",
    },
    {
      cle: "archivage",
      titre: "Archiver le TMF et les classeurs investigateurs pour la durée réglementaire",
      phase: "cloture",
    },
  ],
};

// ---------------------------------------------------------------- RIPH 2

const RIPH2: Referentiel = {
  cle: "riph2",
  nom: "RIPH catégorie 2 — risques et contraintes minimes",
  resume:
    "Recherche interventionnelle ne portant pas sur un médicament et ne comportant que des " +
    "risques et contraintes minimes. Avis du CPP requis ; l'ANSM est informée, elle n'autorise pas.",
  categorie: "type",
  verifieLe: "2026-08-04",
  sources: [
    {
      libelle: "ANSM — essais de catégories 2 et 3",
      url: "https://ansm.sante.fr/vos-demarches/chercheur/demander-une-autorisation-pour-des-essais-de-categorie-2-et-3-riph-2-et-3",
    },
    {
      libelle: "Portail de transmission",
      url: "https://demarche.numerique.gouv.fr/commencer/essais-cliniques-riph2-et-riph3",
    },
  ],
  items: [
    {
      cle: "categorie",
      titre: "Confirmer le classement en catégorie 2 et documenter le raisonnement",
      description:
        "La liste des recherches à risques et contraintes minimes est fixée par arrêté. " +
        "Vérifiez que votre intervention y figure bien avant de vous engager dans ce circuit.",
      reference: "Art. L.1121-1, 2° CSP",
      phase: "conception",
    },
    {
      cle: "promoteur",
      titre: "Désigner le promoteur",
      phase: "conception",
    },
    {
      cle: "protocole",
      titre: "Rédiger le protocole et le synopsis",
      phase: "conception",
    },
    {
      cle: "assurance",
      titre: "Souscrire l'assurance de responsabilité civile du promoteur",
      reference: "Art. L.1121-10 CSP",
      phase: "conception",
    },
    {
      cle: "id_rcb",
      titre: "Obtenir le numéro ID-RCB",
      phase: "conception",
    },
    {
      cle: "consentement_doc",
      titre: "Rédiger la note d'information et le formulaire de consentement",
      description:
        "En catégorie 2, le consentement est libre, éclairé et exprès. Vérifiez la modalité de " +
        "recueil admise pour votre recherche.",
      reference: "Art. L.1122-1-1 CSP",
      phase: "conception",
    },
    {
      cle: "cpp_tirage",
      titre: "Déposer le dossier sur SI-RIPH pour le tirage au sort du CPP",
      phase: "soumission",
    },
    {
      cle: "avis_cpp",
      titre: "Obtenir l'avis favorable du CPP avant tout acte de recherche",
      phase: "soumission",
    },
    {
      cle: "ansm_information",
      titre: "Transmettre à l'ANSM l'avis final du CPP et le résumé de la recherche",
      description:
        "Via demarche.numerique.gouv.fr. Cette transmission ne concerne que le dossier initial, " +
        "pas les modifications substantielles.",
      phase: "soumission",
    },
    {
      cle: "cnil",
      titre: "Déclarer la conformité à la méthodologie de référence CNIL applicable",
      phase: "soumission",
    },
    {
      cle: "conventions",
      titre: "Signer les conventions avec les centres",
      phase: "mise_en_place",
    },
    {
      cle: "equipe",
      titre: "Vérifier les CV, formations BPC et registre de délégation",
      phase: "mise_en_place",
    },
    {
      cle: "mise_en_place_reunion",
      titre: "Organiser la réunion de mise en place",
      phase: "mise_en_place",
    },
    {
      cle: "crf",
      titre: "Mettre en service le cahier d'observation et le plan de gestion des données",
      phase: "mise_en_place",
    },
    {
      cle: "classeurs",
      titre: "Ouvrir le classeur investigateur et le TMF",
      phase: "mise_en_place",
    },
    {
      cle: "consentement_recueil",
      titre: "Vérifier le recueil du consentement avant tout acte spécifique à la recherche",
      phase: "conduite",
    },
    {
      cle: "eig",
      titre: "Assurer le circuit de déclaration des événements indésirables graves",
      phase: "conduite",
    },
    {
      cle: "modifications",
      titre: "Soumettre les modifications substantielles au CPP",
      phase: "conduite",
    },
    {
      cle: "monitoring",
      titre: "Réaliser le monitoring selon le plan basé sur les risques",
      phase: "conduite",
    },
    {
      cle: "fin_declaration",
      titre: "Déclarer la fin de la recherche au CPP",
      description: "Délai usuel de 90 jours, ramené à 15 jours en cas d'arrêt anticipé.",
      reference: "Art. R.1123-60 CSP",
      phase: "cloture",
    },
    {
      cle: "rapport_final",
      titre: "Rédiger le rapport final et transmettre le résumé des résultats",
      phase: "cloture",
    },
    {
      cle: "information_participants",
      titre: "Informer les participants des résultats globaux",
      phase: "cloture",
    },
    {
      cle: "archivage",
      titre: "Archiver le TMF et les classeurs investigateurs",
      phase: "cloture",
    },
  ],
};

// ---------------------------------------------------------------- RIPH 3

const RIPH3: Referentiel = {
  cle: "riph3",
  nom: "RIPH catégorie 3 — recherche non interventionnelle",
  resume:
    "Recherche observationnelle : tous les actes sont pratiqués et les produits utilisés de " +
    "manière habituelle. Avis du CPP requis ; l'ANSM est informée.",
  categorie: "type",
  verifieLe: "2026-08-04",
  sources: [
    {
      libelle: "ANSM — essais de catégories 2 et 3",
      url: "https://ansm.sante.fr/vos-demarches/chercheur/demander-une-autorisation-pour-des-essais-de-categorie-2-et-3-riph-2-et-3",
    },
  ],
  items: [
    {
      cle: "categorie",
      titre: "Confirmer le caractère non interventionnel et documenter le raisonnement",
      description:
        "Le moindre acte ajouté pour les besoins de la recherche fait basculer l'étude en " +
        "catégorie 2. Passez la liste des actes du protocole un par un — c'est le piège classique.",
      reference: "Art. L.1121-1, 3° CSP",
      phase: "conception",
    },
    {
      cle: "riph_ou_non",
      titre: "Vérifier s'il s'agit bien d'une RIPH et non d'une étude sur données (RNIPH)",
      description:
        "Une étude portant uniquement sur des données déjà collectées ne relève généralement pas " +
        "de la loi Jardé mais du cadre CNIL (MR-004). Le circuit n'est alors pas le même.",
      phase: "conception",
    },
    {
      cle: "promoteur",
      titre: "Désigner le promoteur",
      phase: "conception",
    },
    {
      cle: "protocole",
      titre: "Rédiger le protocole et le synopsis",
      phase: "conception",
    },
    {
      cle: "id_rcb",
      titre: "Obtenir le numéro ID-RCB",
      phase: "conception",
    },
    {
      cle: "information_doc",
      titre: "Rédiger la note d'information et les modalités de non-opposition",
      description:
        "En catégorie 3, le régime est celui de la non-opposition et non du consentement exprès. " +
        "L'information reste obligatoire.",
      reference: "Art. L.1122-1-1 CSP",
      phase: "conception",
    },
    {
      cle: "assurance",
      titre: "Vérifier la couverture assurantielle applicable à la recherche",
      description:
        "L'obligation d'assurance vise les recherches interventionnelles. Faites confirmer la " +
        "situation de votre étude plutôt que de la présumer.",
      phase: "conception",
      obligatoire: false,
    },
    {
      cle: "cpp_tirage",
      titre: "Déposer le dossier sur SI-RIPH pour le tirage au sort du CPP",
      phase: "soumission",
    },
    {
      cle: "avis_cpp",
      titre: "Obtenir l'avis favorable du CPP avant le début de la recherche",
      phase: "soumission",
    },
    {
      cle: "ansm_information",
      titre: "Transmettre à l'ANSM l'avis final du CPP et le résumé de la recherche",
      description: "Via demarche.numerique.gouv.fr, pour le dossier initial uniquement.",
      phase: "soumission",
    },
    {
      cle: "cnil",
      titre: "Déclarer la conformité à la méthodologie de référence CNIL applicable",
      phase: "soumission",
    },
    {
      cle: "conventions",
      titre: "Formaliser les conventions avec les centres participants",
      phase: "mise_en_place",
    },
    {
      cle: "crf",
      titre: "Mettre en service le recueil de données et le plan de gestion des données",
      phase: "mise_en_place",
    },
    {
      cle: "classeurs",
      titre: "Ouvrir le dossier de l'étude et la documentation essentielle",
      phase: "mise_en_place",
    },
    {
      cle: "non_opposition",
      titre: "Tracer l'information et la non-opposition des participants",
      phase: "conduite",
    },
    {
      cle: "modifications",
      titre: "Soumettre les modifications substantielles au CPP",
      phase: "conduite",
    },
    {
      cle: "qualite",
      titre: "Réaliser les contrôles qualité prévus au protocole",
      phase: "conduite",
    },
    {
      cle: "fin_declaration",
      titre: "Déclarer la fin de la recherche au CPP",
      phase: "cloture",
    },
    {
      cle: "rapport_final",
      titre: "Rédiger le rapport final et transmettre le résumé des résultats",
      phase: "cloture",
    },
    {
      cle: "archivage",
      titre: "Archiver la documentation de l'étude",
      phase: "cloture",
    },
  ],
};

// ------------------------------------------------- Règlement (UE) 536/2014

const CTR: Referentiel = {
  cle: "ctr_medicament",
  nom: "Règlement (UE) 536/2014 — essai de médicament",
  resume:
    "Essai clinique de médicament à usage humain. Soumission unique via CTIS, évaluation en " +
    "Partie I (scientifique, coordonnée par l'État membre rapporteur) et Partie II (nationale).",
  categorie: "type",
  verifieLe: "2026-08-04",
  sources: [
    {
      libelle: "ANSM — avis aux promoteurs, règlement 536/2014",
      url: "https://ansm.sante.fr/vos-demarches/chercheur",
    },
    {
      libelle: "Règlement (UE) n° 536/2014",
      url: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32014R0536",
    },
  ],
  items: [
    {
      cle: "champ",
      titre: "Confirmer que l'essai relève bien du règlement 536/2014",
      description:
        "Essai clinique portant sur un médicament à usage humain. Une étude observationnelle sur " +
        "médicament reste en RIPH 3.",
      phase: "conception",
    },
    {
      cle: "promoteur_ue",
      titre: "Désigner le promoteur et, s'il est hors UE, son représentant légal dans l'Union",
      reference: "Art. 74 du règlement",
      phase: "conception",
    },
    {
      cle: "compte_ctis",
      titre: "Créer et faire valider le compte organisation dans CTIS",
      description:
        "À anticiper largement : l'enregistrement de l'organisation et l'attribution des rôles " +
        "prennent du temps et bloquent toute soumission.",
      phase: "conception",
    },
    {
      cle: "dossier_partie1",
      titre: "Constituer le dossier de Partie I",
      description:
        "Protocole, brochure pour l'investigateur, dossier du médicament expérimental (IMPD), " +
        "étiquetage, justification scientifique.",
      reference: "Annexe I du règlement",
      phase: "conception",
    },
    {
      cle: "dossier_partie2",
      titre: "Constituer le dossier de Partie II",
      description:
        "Volet national : consentement éclairé, modalités de recrutement, indemnisation, " +
        "aptitude des investigateurs et des sites, protection des données.",
      reference: "Annexe I, section 4 du règlement",
      phase: "conception",
    },
    {
      cle: "assurance",
      titre: "Mettre en place l'assurance ou le mécanisme d'indemnisation",
      reference: "Art. 76 du règlement",
      phase: "conception",
    },
    {
      cle: "soumission_ctis",
      titre: "Soumettre la demande unique via CTIS",
      description:
        "Désignez l'État membre rapporteur et les États membres concernés. Une seule soumission " +
        "vaut pour tous.",
      phase: "soumission",
    },
    {
      cle: "rfi",
      titre: "Répondre aux demandes d'informations complémentaires dans les délais",
      description:
        "Les délais du règlement sont stricts : une absence de réponse dans le délai imparti rend " +
        "la demande caduque. Alertez-vous dès réception.",
      phase: "soumission",
    },
    {
      cle: "cpp_partie2",
      titre: "Suivre l'avis du CPP au titre de la Partie II en France",
      phase: "soumission",
    },
    {
      cle: "decision",
      titre: "Obtenir la décision de chaque État membre concerné via CTIS",
      description:
        "Notifiée au plus tard 5 jours après le dernier rapport d'évaluation (Partie I ou II).",
      reference: "Art. 8 du règlement",
      phase: "soumission",
    },
    {
      cle: "cnil",
      titre: "Déclarer la conformité à la méthodologie de référence CNIL applicable",
      phase: "soumission",
    },
    {
      cle: "notif_debut",
      titre: "Notifier le début de l'essai dans CTIS",
      description: "Dans les 15 jours suivant le début de l'essai dans l'État membre concerné.",
      reference: "Art. 36 du règlement",
      phase: "mise_en_place",
    },
    {
      cle: "circuit_me",
      titre: "Valider le circuit du médicament expérimental",
      description:
        "Libération par la personne qualifiée, étiquetage conforme, traçabilité, conditions de " +
        "conservation et suivi des températures, retour et destruction.",
      reference: "Annexe VI du règlement",
      phase: "mise_en_place",
    },
    {
      cle: "equipe",
      titre: "Vérifier les formations BPC et formaliser la délégation des tâches",
      phase: "mise_en_place",
    },
    {
      cle: "susar",
      titre: "Déclarer les SUSAR à EudraVigilance dans les délais",
      description:
        "7 jours pour les suspicions fatales ou mettant en jeu le pronostic vital, 15 jours pour " +
        "les autres.",
      reference: "Art. 42 du règlement",
      phase: "conduite",
    },
    {
      cle: "dsur",
      titre: "Soumettre le rapport annuel de sécurité (DSUR)",
      reference: "Art. 43 du règlement",
      phase: "conduite",
    },
    {
      cle: "modifications",
      titre: "Soumettre les modifications substantielles via CTIS",
      reference: "Art. 15 à 24 du règlement",
      phase: "conduite",
    },
    {
      cle: "mesures_urgentes",
      titre: "Notifier les mesures urgentes de sécurité",
      description: "Sans délai indu et au plus tard dans les 7 jours.",
      reference: "Art. 54 du règlement",
      phase: "conduite",
    },
    {
      cle: "infractions_graves",
      titre: "Notifier les infractions graves au protocole ou au règlement",
      description: "Dans les 7 jours suivant la connaissance de l'infraction.",
      reference: "Art. 52 du règlement",
      phase: "conduite",
    },
    {
      cle: "evenements_inattendus",
      titre: "Notifier les événements inattendus affectant le rapport bénéfice/risque",
      description: "Dans les 15 jours.",
      reference: "Art. 53 du règlement",
      phase: "conduite",
    },
    {
      cle: "monitoring",
      titre: "Réaliser le monitoring selon le plan basé sur les risques",
      phase: "conduite",
    },
    {
      cle: "notif_fin",
      titre: "Notifier la fin de l'essai dans CTIS",
      description:
        "Dans les 15 jours suivant la fin de l'essai. Même délai en cas d'arrêt anticipé, avec " +
        "justification.",
      reference: "Art. 37 du règlement",
      phase: "cloture",
    },
    {
      cle: "resultats",
      titre: "Déposer le résumé des résultats dans CTIS",
      description:
        "Dans les 12 mois suivant la fin de l'essai. Délai raccourci pour certains essais " +
        "pédiatriques : vérifiez le cas applicable.",
      reference: "Art. 37 et annexe IV du règlement",
      phase: "cloture",
    },
    {
      cle: "resume_profane",
      titre: "Déposer le résumé destiné aux personnes non spécialistes",
      reference: "Annexe V du règlement",
      phase: "cloture",
    },
    {
      cle: "archivage_25",
      titre: "Archiver le contenu du TMF pendant au moins 25 ans après la fin de l'essai",
      description:
        "Durée nettement plus longue que sous l'ancien régime : dimensionnez la solution " +
        "d'archivage en conséquence.",
      reference: "Art. 58 du règlement",
      phase: "cloture",
    },
  ],
};

// ------------------------------------------------ Règlement (UE) 2017/745

const MDR: Referentiel = {
  cle: "mdr_dm",
  nom: "Règlement (UE) 2017/745 — investigation clinique de dispositif médical",
  resume:
    "Investigation clinique portant sur un dispositif médical. En France, relève de la RIPH 1 " +
    "avec autorisation de l'ANSM et avis du CPP. Référentiel de bonnes pratiques : ISO 14155.",
  categorie: "type",
  verifieLe: "2026-08-04",
  sources: [
    {
      libelle: "ANSM — investigations cliniques de DM",
      url: "https://ansm.sante.fr/vos-demarches/chercheur/demander-une-autorisation-pour-une-investigation-clinique",
    },
    {
      libelle: "Règlement (UE) 2017/745",
      url: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32017R0745",
    },
  ],
  items: [
    {
      cle: "cadre",
      titre: "Déterminer le cadre applicable de l'investigation",
      description:
        "Investigation en vue du marquage CE (art. 62), suivi clinique après commercialisation " +
        "(art. 74) ou autre investigation (art. 82) : les obligations diffèrent.",
      reference: "Art. 62, 74 et 82 du règlement",
      phase: "conception",
    },
    {
      cle: "iso14155",
      titre: "Adopter la norme ISO 14155 comme référentiel de bonnes pratiques cliniques",
      phase: "conception",
    },
    {
      cle: "dossier_xv",
      titre: "Constituer le dossier de demande selon l'annexe XV",
      description:
        "Brochure de l'investigateur, protocole, évaluation du rapport bénéfice/risque, analyse " +
        "de risque, documentation technique pertinente.",
      reference: "Annexe XV du règlement",
      phase: "conception",
    },
    {
      cle: "assurance",
      titre: "Mettre en place le mécanisme de dédommagement des participants",
      reference: "Art. 69 du règlement",
      phase: "conception",
    },
    {
      cle: "numero_unique",
      titre: "Obtenir le numéro d'identification unique de l'investigation",
      description: "Attribué via le système électronique européen (EUDAMED).",
      reference: "Art. 70 du règlement",
      phase: "conception",
    },
    {
      cle: "consentement_doc",
      titre: "Rédiger la note d'information et le formulaire de consentement éclairé",
      reference: "Art. 63 du règlement",
      phase: "conception",
    },
    {
      cle: "soumission",
      titre: "Soumettre la demande à l'ANSM et au CPP",
      description: "En France, le circuit RIPH 1 s'applique : autorisation ANSM et avis du CPP.",
      phase: "soumission",
    },
    {
      cle: "reponses",
      titre: "Répondre aux questions de l'ANSM et du CPP dans les délais",
      phase: "soumission",
    },
    {
      cle: "cnil",
      titre: "Déclarer la conformité à la méthodologie de référence CNIL applicable",
      phase: "soumission",
    },
    {
      cle: "conventions",
      titre: "Signer les conventions avec les centres investigateurs",
      phase: "mise_en_place",
    },
    {
      cle: "tracabilite_dm",
      titre: "Organiser la traçabilité des dispositifs investigués",
      description: "Réception, attribution, retour et destruction, avec identification unique.",
      phase: "mise_en_place",
    },
    {
      cle: "equipe",
      titre: "Vérifier les CV, les formations et la délégation des tâches",
      phase: "mise_en_place",
    },
    {
      cle: "vigilance",
      titre: "Déclarer les événements indésirables graves et défectuosités du dispositif",
      description:
        "Délais courts et gradués selon la gravité (2 ou 7 jours calendaires). Vérifiez le délai " +
        "exact applicable à chaque type d'événement.",
      reference: "Art. 80 du règlement",
      phase: "conduite",
    },
    {
      cle: "modifications",
      titre: "Notifier les modifications substantielles",
      reference: "Art. 75 du règlement",
      phase: "conduite",
    },
    {
      cle: "monitoring",
      titre: "Réaliser le monitoring selon le plan basé sur les risques",
      phase: "conduite",
    },
    {
      cle: "fin_notification",
      titre: "Notifier la fin de l'investigation clinique",
      description:
        "Dans les 15 jours. Délai raccourci et justification requise en cas d'arrêt anticipé.",
      reference: "Art. 77 du règlement",
      phase: "cloture",
    },
    {
      cle: "rapport",
      titre: "Déposer le rapport d'investigation clinique et son résumé",
      description:
        "Dans l'année suivant la fin de l'investigation, ou dans les 3 mois en cas d'arrêt " +
        "anticipé.",
      reference: "Art. 77 du règlement",
      phase: "cloture",
    },
    {
      cle: "archivage",
      titre: "Archiver la documentation pour la durée prévue par le règlement",
      description:
        "Au moins 10 ans après la fin de l'investigation, portés à 15 ans pour les dispositifs " +
        "implantables. Confirmez la durée applicable à votre dispositif.",
      phase: "cloture",
    },
  ],
};

// ------------------------------------------------ Règlement (UE) 2017/746

const IVDR: Referentiel = {
  cle: "ivdr_div",
  nom: "Règlement (UE) 2017/746 — étude des performances (DM de diagnostic in vitro)",
  resume:
    "Étude des performances d'un dispositif médical de diagnostic in vitro. Référentiel de " +
    "bonnes pratiques : ISO 20916.",
  categorie: "type",
  verifieLe: "2026-08-04",
  sources: [
    {
      libelle: "Règlement (UE) 2017/746",
      url: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32017R0746",
    },
    { libelle: "ANSM — démarches chercheur", url: "https://ansm.sante.fr/vos-demarches/chercheur" },
  ],
  items: [
    {
      cle: "cadre",
      titre: "Déterminer le type d'étude des performances et le régime applicable",
      description:
        "Les études interventionnelles cliniques des performances et celles impliquant un " +
        "prélèvement supplémentaire relèvent d'un régime d'autorisation renforcé.",
      reference: "Art. 58 du règlement",
      phase: "conception",
    },
    {
      cle: "iso20916",
      titre: "Adopter la norme ISO 20916 comme référentiel de bonnes pratiques",
      phase: "conception",
      obligatoire: false,
    },
    {
      cle: "dossier_xiii",
      titre: "Constituer le dossier selon l'annexe XIII",
      description: "Plan d'évaluation des performances, protocole, analyse de risque.",
      reference: "Annexe XIII du règlement",
      phase: "conception",
    },
    {
      cle: "numero_unique",
      titre: "Obtenir le numéro d'identification unique de l'étude",
      reference: "Art. 66 du règlement",
      phase: "conception",
    },
    {
      cle: "consentement_doc",
      titre: "Rédiger la note d'information et le formulaire de consentement",
      reference: "Art. 59 du règlement",
      phase: "conception",
    },
    {
      cle: "echantillons",
      titre: "Sécuriser le circuit des échantillons biologiques",
      description:
        "Collection, conservation, traçabilité, et déclaration de collection biologique si " +
        "applicable.",
      phase: "conception",
    },
    {
      cle: "soumission",
      titre: "Soumettre la demande aux autorités compétentes et au CPP",
      phase: "soumission",
    },
    {
      cle: "cnil",
      titre: "Déclarer la conformité à la méthodologie de référence CNIL applicable",
      phase: "soumission",
    },
    {
      cle: "conventions",
      titre: "Signer les conventions avec les centres",
      phase: "mise_en_place",
    },
    {
      cle: "equipe",
      titre: "Vérifier les formations et la délégation des tâches",
      phase: "mise_en_place",
    },
    {
      cle: "vigilance",
      titre: "Déclarer les événements indésirables graves selon les délais du règlement",
      reference: "Art. 76 du règlement",
      phase: "conduite",
    },
    {
      cle: "modifications",
      titre: "Notifier les modifications substantielles",
      reference: "Art. 71 du règlement",
      phase: "conduite",
    },
    {
      cle: "fin_notification",
      titre: "Notifier la fin de l'étude des performances",
      reference: "Art. 73 du règlement",
      phase: "cloture",
    },
    {
      cle: "rapport",
      titre: "Déposer le rapport d'étude des performances et son résumé",
      phase: "cloture",
    },
    {
      cle: "archivage",
      titre: "Archiver la documentation pour la durée prévue par le règlement",
      phase: "cloture",
    },
  ],
};

// ------------------------------------------------------------- ICH E6(R3)

const ICH_E6R3: Referentiel = {
  cle: "ich_e6r3",
  nom: "ICH E6(R3) — bonnes pratiques cliniques",
  resume:
    "Principes et Annexe 1 applicables depuis le 23 juillet 2025 (EMA). L'Annexe 2 (essais non " +
    "traditionnels : décentralisés, pragmatiques, données de vie réelle) entre en vigueur le " +
    "15 janvier 2027.",
  categorie: "transversal",
  verifieLe: "2026-08-04",
  sources: [
    {
      libelle: "EMA — ICH E6 Good clinical practice",
      url: "https://www.ema.europa.eu/en/ich-e6-good-clinical-practice-scientific-guideline",
    },
    { libelle: "ICH — E6(R3)", url: "https://www.ich.org/page/efficacy-guidelines" },
  ],
  items: [
    {
      cle: "qbd",
      titre: "Appliquer la qualité dès la conception et identifier les facteurs critiques",
      description:
        "L'un des apports majeurs de la R3 : identifier en amont ce qui compte vraiment pour la " +
        "fiabilité des résultats et la sécurité des participants, plutôt que de tout contrôler " +
        "uniformément. Documentez cette analyse, elle justifie tout le reste.",
      phase: "conception",
    },
    {
      cle: "risques",
      titre: "Formaliser l'approche proportionnée au risque",
      description:
        "Le plan de monitoring, l'étendue du contrôle qualité et la vérification des données " +
        "sources découlent de l'analyse de risque, et doivent y renvoyer explicitement.",
      phase: "conception",
    },
    {
      cle: "gouvernance_donnees",
      titre: "Documenter la gouvernance des données sur tout leur cycle de vie",
      description:
        "De la collecte à l'archivage : origine, transformations, contrôles, accès. Point très " +
        "renforcé par la R3.",
      phase: "conception",
    },
    {
      cle: "systemes",
      titre: "Qualifier les systèmes informatisés et leurs fournisseurs",
      description:
        "Validation adaptée à l'usage, gestion des accès, piste d'audit, plan de continuité, " +
        "contrats de service.",
      phase: "mise_en_place",
    },
    {
      cle: "prestataires",
      titre: "Encadrer la supervision des prestataires et la délégation d'activités",
      description:
        "La responsabilité du promoteur ne se délègue pas : la supervision doit être tracée.",
      phase: "mise_en_place",
    },
    {
      cle: "formation",
      titre: "Former les équipes aux BPC dans leur version E6(R3)",
      description:
        "Une formation BPC datée d'avant juillet 2025 ne couvre pas la R3. Vérifiez les " +
        "attestations de votre équipe et des investigateurs.",
      phase: "mise_en_place",
    },
    {
      cle: "supervision_investigateur",
      titre: "Formaliser la supervision par l'investigateur et le registre de délégation",
      phase: "mise_en_place",
    },
    {
      cle: "enregistrements",
      titre: "Tenir à jour les enregistrements essentiels et le TMF en continu",
      description:
        "La R3 raisonne en « enregistrements essentiels » plutôt qu'en liste figée de documents : " +
        "justifiez ce que vous conservez au regard de la reconstitution de l'essai.",
      phase: "conduite",
    },
    {
      cle: "ecarts",
      titre: "Gérer les écarts au protocole et les actions correctives",
      description:
        "Détection, évaluation de l'impact, correction, prévention de la récurrence. Distinguez " +
        "clairement les écarts importants.",
      phase: "conduite",
    },
    {
      cle: "consentement",
      titre: "Vérifier la conformité du processus de consentement éclairé",
      phase: "conduite",
    },
    {
      cle: "donnees_sources",
      titre: "Garantir les caractéristiques des données sources",
      description:
        "Attribuables, lisibles, contemporaines, originales, exactes et complètes — et " +
        "traçables jusqu'à leur origine.",
      phase: "conduite",
    },
    {
      cle: "annexe2",
      titre: "Préparer l'application de l'Annexe 2 si l'essai est décentralisé ou pragmatique",
      description:
        "Entrée en vigueur au 15 janvier 2027. Si votre essai comporte des visites à domicile, " +
        "de la télémédecine, des objets connectés ou des données de vie réelle, anticipez.",
      phase: "conduite",
      obligatoire: false,
    },
    {
      cle: "archivage",
      titre: "Assurer la conservation et la lisibilité des enregistrements sur toute la durée",
      description:
        "Y compris la lisibilité des formats électroniques dans 10 ou 25 ans : c'est un point " +
        "souvent négligé.",
      phase: "cloture",
    },
  ],
};

// --------------------------------------------------------------- CNIL/RGPD

const CNIL: Referentiel = {
  cle: "cnil_mr",
  nom: "RGPD et CNIL — méthodologies de référence",
  resume:
    "Les MR-001 (avec consentement) et MR-003 (sans consentement) ont été refondues par " +
    "délibérations du 19 mars 2026 et sont en vigueur depuis le 23 mai 2026. Des grilles de " +
    "conformité ont été publiées le 26 mai 2026.",
  categorie: "transversal",
  verifieLe: "2026-08-04",
  sources: [
    {
      libelle: "CNIL — vérifier sa conformité aux MR-001 et MR-003",
      url: "https://www.cnil.fr/fr/methodologies-de-reference-pour-les-recherches-en-sante-verifier-sa-conformite-aux-mr-001-et-mr-003",
    },
    {
      libelle: "CNIL — mise à jour et élargissement des MR-001 et MR-003",
      url: "https://www.cnil.fr/fr/recherche-en-sante-la-cnil-met-jour-et-elargit-le-champ-des-methodologies-de-reference-001-et-003",
    },
  ],
  items: [
    {
      cle: "choix_mr",
      titre: "Déterminer la méthodologie de référence applicable",
      description:
        "MR-001 : recherche avec recueil du consentement. MR-003 : recherche sans recueil du " +
        "consentement. MR-004 : étude n'impliquant pas la personne humaine (recherche sur " +
        "données). MR-005 et MR-006 pour les données du PMSI et du SNDS.",
      phase: "conception",
    },
    {
      cle: "version_2026",
      titre: "Travailler sur la version 2026 des MR-001 et MR-003",
      description:
        "En vigueur depuis le 23 mai 2026, avec un périmètre élargi : études menées à " +
        "l'étranger, information dématérialisée, contrôle qualité à distance, accès aux données " +
        "d'identification, destinataires des données.",
      phase: "conception",
    },
    {
      cle: "grille",
      titre: "Passer la grille de conformité CNIL correspondante",
      description:
        "Publiées le 26 mai 2026 pour MR-001 et MR-003. C'est l'outil le plus rapide pour " +
        "vérifier que rien ne manque.",
      phase: "conception",
    },
    {
      cle: "hors_mr",
      titre: "Si le projet sort du cadre d'une MR, déposer une demande d'autorisation à la CNIL",
      description:
        "Anticipez : le délai d'instruction est sans commune mesure avec une simple déclaration " +
        "de conformité.",
      phase: "conception",
    },
    {
      cle: "aipd",
      titre: "Réaliser une analyse d'impact relative à la protection des données si nécessaire",
      phase: "conception",
    },
    {
      cle: "declaration",
      titre: "Effectuer la déclaration de conformité auprès de la CNIL",
      description:
        "Une déclaration faite au titre d'une version antérieure d'une MR n'a pas à être " +
        "refaite pour la version 2026.",
      phase: "soumission",
    },
    {
      cle: "registre",
      titre: "Inscrire le traitement au registre des activités de traitement",
      phase: "soumission",
    },
    {
      cle: "information",
      titre: "Vérifier l'information des personnes et ses modalités",
      description:
        "Les modalités dématérialisées sont désormais explicitement encadrées par les MR 2026.",
      phase: "mise_en_place",
    },
    {
      cle: "securite",
      titre: "Appliquer les mesures de sécurité de l'annexe dédiée des MR",
      description:
        "Chiffrement, gestion des habilitations, traçabilité des accès, sauvegardes, " +
        "pseudonymisation.",
      phase: "mise_en_place",
    },
    {
      cle: "sous_traitance",
      titre: "Encadrer les sous-traitants par un contrat conforme à l'article 28 du RGPD",
      phase: "mise_en_place",
    },
    {
      cle: "transferts",
      titre: "Encadrer les transferts de données hors Union européenne",
      phase: "mise_en_place",
    },
    {
      cle: "controle_qualite",
      titre: "Encadrer le contrôle qualité, y compris à distance",
      description:
        "Le monitoring à distance fait l'objet d'une annexe dédiée dans les MR 2026 : vérifiez " +
        "que vos modalités y sont conformes.",
      phase: "conduite",
    },
    {
      cle: "droits",
      titre: "Organiser l'exercice des droits des personnes",
      phase: "conduite",
    },
    {
      cle: "conservation",
      titre: "Respecter les durées de conservation et l'archivage intermédiaire",
      phase: "cloture",
    },
  ],
};

// -------------------------------------------------------------- Archivage

const ARCHIVAGE: Referentiel = {
  cle: "archivage",
  nom: "Clôture et archivage",
  resume:
    "Bonnes pratiques transversales de fin d'étude : gel de base, complétude du TMF, " +
    "archivage et accessibilité en cas d'inspection.",
  categorie: "transversal",
  verifieLe: "2026-08-04",
  sources: [],
  items: [
    {
      cle: "duree",
      titre: "Déterminer la durée de conservation applicable et la tracer",
      description:
        "Elle varie fortement selon le cadre : 25 ans pour un essai sous règlement 536/2014, " +
        "durées propres au DM, règles internes du promoteur. Écrivez la règle retenue.",
      phase: "cloture",
    },
    {
      cle: "gel_base",
      titre: "Geler la base de données et documenter le gel",
      description: "Après résolution des queries, codage et revue des données.",
      phase: "cloture",
    },
    {
      cle: "completude_tmf",
      titre: "Vérifier la complétude du TMF avant archivage",
      description:
        "Faites la revue de complétude avant de fermer, pas après : retrouver un document " +
        "manquant devient très difficile une fois les centres clôturés.",
      phase: "cloture",
    },
    {
      cle: "cloture_centres",
      titre: "Clôturer les centres et récupérer les classeurs investigateurs",
      phase: "cloture",
    },
    {
      cle: "produits",
      titre: "Solder le circuit des produits et dispositifs (retour, destruction, certificats)",
      phase: "cloture",
    },
    {
      cle: "lisibilite",
      titre: "Garantir la lisibilité des archives électroniques sur toute la durée",
      phase: "cloture",
    },
    {
      cle: "acces_inspection",
      titre: "Prévoir l'accès aux archives en cas d'inspection",
      description: "Localisation, responsable, délai de mise à disposition.",
      phase: "cloture",
    },
  ],
};

// ------------------------------------------------------------------ Index

export const REFERENTIELS: Referentiel[] = [
  RIPH1,
  RIPH2,
  RIPH3,
  CTR,
  MDR,
  IVDR,
  ICH_E6R3,
  CNIL,
  ARCHIVAGE,
];

export const REFERENTIELS_PAR_CLE = new Map(REFERENTIELS.map((r) => [r.cle, r]));

export function referentiel(cle: string): Referentiel | undefined {
  return REFERENTIELS_PAR_CLE.get(cle);
}

/** Lit le champ `reglementations` d'une étude (stocké en JSON). */
export function lireReglementations(valeur: string | null | undefined): string[] {
  if (!valeur) return [];
  try {
    const brut = JSON.parse(valeur);
    return Array.isArray(brut) ? brut.filter((c): c is string => typeof c === "string") : [];
  } catch {
    return [];
  }
}

export { AVERTISSEMENT };
