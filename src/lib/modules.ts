import type { NomIcone } from "@/components/icones";

/**
 * Catalogue des modules de Vigie.
 *
 * Un module est un pan de l'outil qu'on active ou désactive selon son métier.
 * Le rôle choisi à l'inscription ne fait que **pré-cocher** une sélection :
 * tout reste modifiable à tout moment depuis les paramètres.
 *
 * `href` absent = module annoncé mais pas encore construit. Il apparaît dans
 * les paramètres, grisé, pour donner à voir la suite sans promettre qu'elle
 * est là.
 */
export type Module = {
  cle: string;
  nom: string;
  description: string;
  icone: NomIcone;
  domaine: string;
  /** Libellé court pour la barre latérale, quand le nom complet ne tient pas. */
  libelleNav?: string;
  /** Destination dans la navigation. Absent tant que le module n'existe pas. */
  href?: string;
  /** Un module de socle est toujours actif et ne se décoche pas. */
  socle?: boolean;
  /** Métiers pour lesquels le module est pré-coché à l'inscription. */
  roles: string[];
};

const TOUS = ["arc", "tec", "cp", "autre"];

export const MODULES: Module[] = [
  // --- Socle ---------------------------------------------------------------
  {
    cle: "bord",
    nom: "Tableau de bord",
    description: "Vue d'ensemble : ce qui presse, l'avancement, le temps de la semaine.",
    icone: "accueil",
    domaine: "Socle",
    href: "/bord",
    socle: true,
    roles: TOUS,
  },
  {
    cle: "etudes",
    nom: "Études",
    description: "Un dossier par étude : promoteur, investigateur, identifiants réglementaires.",
    icone: "dossier",
    domaine: "Socle",
    href: "/etudes",
    socle: true,
    roles: TOUS,
  },

  // --- Suivi de projet -----------------------------------------------------
  {
    cle: "missions",
    nom: "Missions",
    description: "Ce qu'il reste à faire, par statut ou par échéance, avec filtres et export.",
    icone: "cible",
    domaine: "Suivi de projet",
    href: "/missions",
    roles: TOUS,
  },
  {
    cle: "extractions",
    nom: "Extractions",
    description:
      "Tableau de suivi des missions, à extraire pour un point avec la hiérarchie.",
    icone: "tableau",
    domaine: "Suivi de projet",
    href: "/extractions",
    socle: true,
    roles: TOUS,
  },
  {
    cle: "documents",
    nom: "Pense-bête",
    description: "Pages classées par catégorie : texte, images, listes.",
    icone: "page",
    domaine: "Suivi de projet",
    href: "/pense-bete",
    socle: true,
    roles: TOUS,
  },
  {
    cle: "calendrier",
    nom: "Calendrier",
    description: "Vue mois et semaine de toutes les échéances, tous modules confondus.",
    icone: "chrono",
    domaine: "Suivi de projet",
    roles: TOUS,
  },
  {
    cle: "jalons",
    nom: "Jalons réglementaires",
    description: "Soumissions, autorisations et dates clés, par étude.",
    icone: "checklist",
    domaine: "Suivi de projet",
    roles: ["cp", "arc"],
  },
  {
    cle: "reunions",
    nom: "Réunions",
    description: "Ordres du jour, comptes rendus et décisions prises.",
    icone: "personnes",
    domaine: "Suivi de projet",
    roles: ["cp"],
  },

  // --- Monitorage et qualité ----------------------------------------------
  {
    cle: "monitorage",
    nom: "Visites de monitorage",
    libelleNav: "Visites",
    description:
      "Visites planifiées et réalisées, par centre : rapport, lettre de suivi, clôture.",
    icone: "repere",
    domaine: "Monitorage et qualité",
    href: "/visites",
    roles: ["arc", "cp"],
  },
  {
    cle: "ecarts",
    nom: "Écarts et déviations",
    libelleNav: "Écarts et déviations",
    description:
      "Déviations au protocole : catégorie, gravité, circonstances et suites données.",
    icone: "alerte",
    domaine: "Monitorage et qualité",
    href: "/ecarts",
    roles: ["arc", "cp"],
  },
  {
    cle: "sdv",
    nom: "Vérification des données sources",
    description: "Avancement du SDV par centre et par étude.",
    icone: "checklist",
    domaine: "Monitorage et qualité",
    roles: ["arc"],
  },
  {
    cle: "audits",
    nom: "Audits et inspections",
    description: "Préparation, déroulé et constats des audits promoteur et inspections ANSM.",
    icone: "bouclier",
    domaine: "Monitorage et qualité",
    roles: ["arc", "cp"],
  },
  {
    cle: "capa",
    nom: "Actions correctives",
    description:
      "Du constat à la clôture : responsable, échéance, et vérification de l'efficacité.",
    icone: "outil",
    domaine: "Monitorage et qualité",
    href: "/actions",
    roles: ["arc", "cp"],
  },

  // --- Terrain -------------------------------------------------------------
  {
    cle: "recrutement",
    nom: "Screening et inclusions",
    description: "Avancement du recrutement : screenés, inclus, échecs, objectif contre réel.",
    icone: "graphique",
    domaine: "Terrain",
    roles: ["tec", "cp"],
  },
  {
    cle: "visites_patients",
    nom: "Planning des visites",
    description: "Charge de visites à venir, par étude et par semaine.",
    icone: "chrono",
    domaine: "Terrain",
    roles: ["tec"],
  },
  {
    cle: "consentements",
    nom: "Circuit des consentements",
    description: "Versions en vigueur et re-consentements à organiser après amendement.",
    icone: "document",
    domaine: "Terrain",
    roles: ["tec", "arc"],
  },
  {
    cle: "echantillons",
    nom: "Prélèvements et échantillons",
    description: "Kits, expéditions et accusés de réception.",
    icone: "dossier",
    domaine: "Terrain",
    roles: ["tec"],
  },
  {
    cle: "produit",
    nom: "Comptabilité produit",
    description: "Réceptions, dispensations, retours et relevés de température.",
    icone: "dossier",
    domaine: "Terrain",
    roles: ["tec", "arc"],
  },

  // --- Données -------------------------------------------------------------
  {
    cle: "queries",
    nom: "Queries",
    description: "Demandes de clarification en attente et délais de réponse.",
    icone: "question",
    domaine: "Données",
    roles: ["arc", "tec"],
  },
  {
    cle: "jalons_data",
    nom: "Jalons data",
    description: "Gel de base, transferts et verrouillage.",
    icone: "checklist",
    domaine: "Données",
    roles: ["cp"],
  },

  // --- Vigilance -----------------------------------------------------------
  {
    cle: "eig",
    nom: "Événements indésirables graves",
    description: "Déclarations, délais réglementaires et suivi jusqu'à résolution.",
    icone: "eclair",
    domaine: "Vigilance",
    roles: ["arc", "tec"],
  },
  {
    cle: "rapports_securite",
    nom: "Rapports de sécurité",
    description: "DSUR, rapport annuel de sécurité et leurs échéances.",
    icone: "document",
    domaine: "Vigilance",
    roles: ["cp"],
  },

  // --- Réglementaire et documentaire --------------------------------------
  {
    cle: "checklists",
    nom: "Checklists réglementaires",
    description: "RIPH, règlement 536/2014, MDR, IVDR, ICH E6(R3), CNIL — selon le cadre coché.",
    icone: "checklist",
    domaine: "Réglementaire et documentaire",
    href: "/etudes",
    roles: TOUS,
  },
  {
    cle: "publipostage",
    nom: "Publipostage",
    description:
      "Conventions et fiches de qualification complétées champ par champ, exportées en Word ou en PDF, et suivies jusqu'au retour du coordo.",
    icone: "enveloppe",
    domaine: "Réglementaire et documentaire",
    href: "/publipostage",
    roles: TOUS,
  },
  {
    cle: "assistant",
    nom: "Assistant",
    description:
      "Questions de réglementation et aide à la rédaction, auprès d'un modèle de langage. Sans accès à vos données.",
    icone: "etincelles",
    domaine: "Réglementaire et documentaire",
    href: "/assistant",
    roles: TOUS,
  },
  {
    cle: "faq",
    nom: "Base de connaissance",
    libelleNav: "Base de connaissance",
    description: "Les questions qui reviennent, répondues une fois pour toutes.",
    icone: "livre",
    domaine: "Réglementaire et documentaire",
    href: "/faq",
    roles: TOUS,
  },

  // --- Administratif et financier ------------------------------------------
  {
    cle: "temps",
    nom: "Suivi du temps",
    libelleNav: "Temps",
    description: "Chronomètre, saisie manuelle et export valorisé.",
    icone: "chrono",
    domaine: "Administratif et financier",
    href: "/temps",
    roles: TOUS,
  },
  {
    cle: "surcouts",
    nom: "Facturation et surcoûts",
    description: "Grille de surcoûts, actes réalisés et reste à facturer.",
    icone: "graphique",
    domaine: "Administratif et financier",
    roles: ["tec", "cp"],
  },
  {
    cle: "budget",
    nom: "Budget et conventions",
    libelleNav: "Budget",
    description:
      "Conventions et avenants : montant contractualisé, déjà perçu, reste à percevoir.",
    icone: "euro",
    domaine: "Administratif et financier",
    href: "/budget",
    roles: ["cp"],
  },
  {
    cle: "centres",
    nom: "Performance des centres",
    description: "Recrutement réel contre prévu, délais d'ouverture.",
    icone: "graphique",
    domaine: "Administratif et financier",
    roles: ["cp"],
  },

  // --- Management ----------------------------------------------------------
  {
    cle: "portefeuille",
    nom: "Portefeuille et charge d'équipe",
    libelleNav: "Portefeuille",
    description:
      "L'état de chaque étude en une ligne, et la charge de chacun sur celles que vous portez.",
    icone: "mallette",
    domaine: "Management",
    href: "/portefeuille",
    roles: ["cp", "arc"],
  },
  {
    cle: "evaluations",
    nom: "Évaluations annuelles",
    description: "Entretiens, objectifs fixés et suivi dans l'année.",
    icone: "personnes",
    domaine: "Management",
    roles: ["cp"],
  },
  {
    cle: "formations",
    nom: "Formations et habilitations",
    description: "BPC, CV, log de délégation — avec les dates d'expiration.",
    icone: "checklist",
    domaine: "Management",
    roles: ["cp", "arc"],
  },
  {
    cle: "indicateurs",
    nom: "Indicateurs",
    description:
      "Charge, retards, conformité réglementaire et tendances — des chiffres présentables en réunion.",
    icone: "courbe",
    domaine: "Management",
    href: "/indicateurs",
    // Utile à tous les métiers : un ARC y suit ses écarts, un TEC sa charge.
    roles: TOUS,
  },
];

/** Ordre d'affichage des domaines dans les paramètres. */
export const DOMAINES = [
  "Socle",
  "Suivi de projet",
  "Monitorage et qualité",
  "Terrain",
  "Données",
  "Vigilance",
  "Réglementaire et documentaire",
  "Administratif et financier",
  "Management",
];

const PAR_CLE = new Map(MODULES.map((m) => [m.cle, m]));

export function module(cle: string): Module | undefined {
  return PAR_CLE.get(cle);
}

/** Un module est utilisable dès lors qu'il a une destination. */
export function construit(m: Module): boolean {
  return m.href !== undefined;
}

/** Les modules de socle, toujours actifs, quoi qu'en dise la sélection. */
export const CLES_SOCLE = MODULES.filter((m) => m.socle).map((m) => m.cle);

/** Sélection pré-cochée pour un métier donné, au moment de l'inscription. */
export function modulesSuggeres(role: string): string[] {
  return MODULES.filter((m) => m.socle || m.roles.includes(role)).map((m) => m.cle);
}

/**
 * Lit la sélection stockée en base. Une valeur illisible ou vide retombe sur
 * la suggestion du métier : la navigation n'est jamais vide.
 */
export function lireModules(brut: string | null | undefined, role: string): string[] {
  if (!brut) return modulesSuggeres(role);
  try {
    const lus = JSON.parse(brut);
    if (!Array.isArray(lus)) return modulesSuggeres(role);
    const valides = lus.filter((c): c is string => typeof c === "string" && PAR_CLE.has(c));
    // Le socle s'ajoute toujours, même si la valeur stockée l'omet.
    return [...new Set([...CLES_SOCLE, ...valides])];
  } catch {
    return modulesSuggeres(role);
  }
}

/**
 * Rubriques de la barre latérale. Elles suivent le fil du travail — piloter,
 * suivre ses études, monitorer, documenter — et non le catalogue des
 * paramètres, qui range les modules par domaine métier.
 */
export const RUBRIQUES_NAVIGATION: { titre: string | null; cles: string[] }[] = [
  { titre: null, cles: ["bord"] },
  { titre: "Études et missions", cles: ["etudes", "missions", "temps", "extractions"] },
  { titre: "Monitorage et qualité", cles: ["monitorage", "ecarts", "capa"] },
  { titre: "Documents", cles: ["documents", "publipostage", "faq", "assistant"] },
  { titre: "Pilotage", cles: ["portefeuille", "indicateurs", "budget"] },
];

export type RubriqueNavigation = { titre: string | null; modules: Module[] };

/**
 * La navigation rangée par rubrique. Un module construit qui n'aurait pas
 * encore de rubrique tombe dans « Autres » plutôt que de disparaître.
 */
export function navigationParRubrique(actifs: string[]): RubriqueNavigation[] {
  const disponibles = navigation(actifs);
  const places = new Set<string>();
  const rubriques = RUBRIQUES_NAVIGATION.map((r) => ({
    titre: r.titre,
    modules: r.cles
      .map((cle) => disponibles.find((m) => m.cle === cle))
      .filter((m): m is Module => m !== undefined),
  }));
  for (const r of rubriques) for (const m of r.modules) places.add(m.cle);
  const autres = disponibles.filter((m) => !places.has(m.cle));
  if (autres.length > 0) rubriques.push({ titre: "Autres", modules: autres });
  return rubriques.filter((r) => r.modules.length > 0);
}

/** Modules actifs **et** construits, dans l'ordre du catalogue : la navigation. */
export function navigation(actifs: string[]): Module[] {
  const choisis = new Set(actifs);
  return MODULES.filter(
    (m) => construit(m) && choisis.has(m.cle) && m.cle !== "checklists",
  );
}
