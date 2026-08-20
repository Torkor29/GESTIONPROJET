import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const maintenant = sql`(unixepoch())`;

/**
 * Une personne qui se connecte. Chacune a sa session, son mot de passe et son
 * métier — ce dernier détermine les modules qui lui sont proposés.
 *
 * Le mot de passe est stocké sous la forme « sel:empreinte », jamais en clair.
 */
export const utilisateurs = sqliteTable("utilisateurs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Sert d'identifiant de connexion. Toujours rangé en minuscules. */
  email: text("email").notNull().unique(),
  motDePasse: text("mot_de_passe").notNull(),
  nom: text("nom").notNull(),
  // "super_admin" | "chef_projet" | "data_manager" | "arc" | "tec" |
  // "investigateur" | "sponsor" | "lecture_seule" | "cp" | "autre"
  role: text("role").notNull().default("autre"),
  /**
   * Clés des modules activés, en JSON : ["missions","documents","temps"].
   * Vide au départ : la sélection suggérée par le métier s'applique alors.
   */
  modules: text("modules"),
  /** Accès d'administration de l'instance, indépendant du métier. */
  superAdmin: integer("super_admin", { mode: "boolean" }).notNull().default(false),
  /** Un compte désactivé conserve ses données mais ne peut plus se connecter. */
  actif: integer("actif", { mode: "boolean" }).notNull().default(true),
  /** Compte issu du jeu de démonstration : identifiable et réinitialisable. */
  estDemo: integer("est_demo", { mode: "boolean" }).notNull().default(false),
  creeLe: integer("cree_le").notNull().default(maintenant),
  derniereConnexion: integer("derniere_connexion"),
});

export type Utilisateur = typeof utilisateurs.$inferSelect;

/**
 * Une étude = un dossier de travail (un projet, un client, un chantier).
 * Tout le reste — pages, tâches, temps — s'y rattache.
 */
export const etudes = sqliteTable("etudes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Propriétaire : seul lui, et les personnes conviées, y ont accès. */
  proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
    onDelete: "cascade",
  }),
  nom: text("nom").notNull(),
  /** Acronyme court affiché comme étiquette : INASED, LIBERTY, PAPAYE… */
  code: text("code"),
  client: text("client"),
  description: text("description"),
  couleur: text("couleur").notNull().default("#6366f1"),
  /** URL de l'image de couverture affichée dans la galerie. */
  imageCouverture: text("image_couverture"),
  // "active" | "en_pause" | "terminee" | "archivee"
  statut: text("statut").notNull().default("active"),
  // Tarif horaire optionnel, utilisé pour valoriser le temps à l'export.
  tarifHoraire: real("tarif_horaire"),

  // --- Spécifique recherche clinique -------------------------------------
  promoteur: text("promoteur"),
  investigateur: text("investigateur"),
  /**
   * Clés des référentiels applicables, en JSON : ["riph2","cnil_mr","ich_e6r3"].
   * Détermine les checklists réglementaires proposées pour l'étude.
   */
  reglementations: text("reglementations").notNull().default("[]"),
  /** Identifiants réglementaires : ID-RCB, n° CTIS/EudraCT, n° CPP, NCT… */
  idRcb: text("id_rcb"),
  numeroCtis: text("numero_ctis"),
  numeroCpp: text("numero_cpp"),
  dateDebut: integer("date_debut"),
  dateFin: integer("date_fin"),

  /** I | II | III | IV | autre */
  phase: text("phase"),
  indication: text("indication"),
  populationCible: text("population_cible"),
  nbCentresPrevu: integer("nb_centres_prevu"),
  nbSujetsPrevu: integer("nb_sujets_prevu"),
  chefProjetId: integer("chef_projet_id").references(() => utilisateurs.id, {
    onDelete: "set null",
  }),
  arcReferentId: integer("arc_referent_id").references(() => utilisateurs.id, {
    onDelete: "set null",
  }),
  dataManagerId: integer("data_manager_id").references(() => utilisateurs.id, {
    onDelete: "set null",
  }),
  versionProtocole: text("version_protocole"),
  /** Étude du jeu de démonstration. */
  estDemo: integer("est_demo", { mode: "boolean" }).notNull().default(false),
  /** 0 = non commencée, 7 = onboarding terminé. */
  onboardingEtape: integer("onboarding_etape").notNull().default(0),

  creeLe: integer("cree_le").notNull().default(maintenant),
  modifieLe: integer("modifie_le").notNull().default(maintenant),
});

/**
 * Une page de contenu riche, façon Notion. Le contenu est le document
 * BlockNote sérialisé en JSON.
 * - etudeId nul = page libre, rangée à la racine.
 * - parentId permet d'imbriquer les pages entre elles.
 */
export const pages = sqliteTable(
  "pages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Propriétaire : seul lui, et les personnes conviées, y ont accès. */
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    etudeId: integer("etude_id").references(() => etudes.id, { onDelete: "cascade" }),
    parentId: integer("parent_id"),
    titre: text("titre").notNull().default("Sans titre"),
    icone: text("icone").notNull().default("📄"),
    // Document BlockNote sérialisé. Tableau JSON de blocs.
    contenu: text("contenu").notNull().default("[]"),
    ordre: integer("ordre").notNull().default(0),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [index("idx_pages_etude").on(t.etudeId), index("idx_pages_parent").on(t.parentId)],
);

/**
 * Une tâche à suivre. Rattachée à une étude, éventuellement à une page.
 */
export const taches = sqliteTable(
  "taches",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Propriétaire : seul lui, et les personnes conviées, y ont accès. */
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    etudeId: integer("etude_id").references(() => etudes.id, { onDelete: "cascade" }),
    titre: text("titre").notNull(),
    notes: text("notes"),
    // "a_faire" | "en_cours" | "bloque" | "terminee"
    statut: text("statut").notNull().default("a_faire"),
    // "basse" | "normale" | "haute" | "critique"
    priorite: text("priorite").notNull().default("normale"),
    assigneeId: integer("assignee_id").references(() => utilisateurs.id, {
      onDelete: "set null",
    }),
    /** query | monitoring | deviation | document | jalon | manuel */
    source: text("source"),
    objetType: text("objet_type"),
    objetId: integer("objet_id"),
    // Date d'échéance, en secondes Unix (minuit heure locale).
    echeance: integer("echeance"),
    ordre: integer("ordre").notNull().default(0),
    termineeLe: integer("terminee_le"),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [index("idx_taches_etude").on(t.etudeId), index("idx_taches_statut").on(t.statut)],
);

/**
 * Une entrée de temps. `fin` à null signifie que le chronomètre tourne encore.
 */
export const temps = sqliteTable(
  "temps",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Propriétaire : seul lui, et les personnes conviées, y ont accès. */
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    etudeId: integer("etude_id").references(() => etudes.id, { onDelete: "cascade" }),
    tacheId: integer("tache_id").references(() => taches.id, { onDelete: "set null" }),
    description: text("description"),
    debut: integer("debut").notNull(),
    fin: integer("fin"),
    creeLe: integer("cree_le").notNull().default(maintenant),
  },
  (t) => [index("idx_temps_etude").on(t.etudeId), index("idx_temps_debut").on(t.debut)],
);

/**
 * Documents rattachés à une étude : protocole, avis CPP, autorisation ANSM,
 * conventions, notes d'information… Le fichier vit sur le disque du serveur,
 * seule sa fiche est en base.
 */
export const documents = sqliteTable(
  "documents",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Propriétaire : seul lui, et les personnes conviées, y ont accès. */
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    etudeId: integer("etude_id").references(() => etudes.id, { onDelete: "cascade" }),
    nom: text("nom").notNull(),
    description: text("description"),
    /** Clé de CATEGORIES_DOCUMENT : protocole, avis_cpp, autorisation_ansm… */
    categorie: text("categorie").notNull().default("autre"),
    version: text("version"),
    /** Nom sur le disque (préfixé d'un aléa) et nom d'origine pour l'affichage. */
    nomFichier: text("nom_fichier").notNull(),
    nomOriginal: text("nom_original").notNull(),
    taille: integer("taille").notNull().default(0),
    typeMime: text("type_mime").notNull().default("application/octet-stream"),
    /** Date du document lui-même (signature, version), distincte du dépôt. */
    dateDocument: integer("date_document"),
    // "brouillon" | "en_vigueur" | "obsolete" | "manquant"
    statut: text("statut").notNull().default("en_vigueur"),
    // "interne" | "confidentiel" | "public"
    confidentialite: text("confidentialite").notNull().default("interne"),
    expiration: integer("expiration"),
    /** tmf_central | tmf_site | isf | autre */
    zone: text("zone").notNull().default("tmf_central"),
    centreId: integer("centre_id"),
    creeLe: integer("cree_le").notNull().default(maintenant),
  },
  (t) => [
    index("idx_documents_etude").on(t.etudeId),
    index("idx_documents_categorie").on(t.categorie),
    index("idx_documents_expiration").on(t.expiration),
  ],
);

/**
 * Ligne de checklist réglementaire, instanciée pour une étude à partir d'un
 * référentiel (voir src/lib/referentiels.ts). On copie le libellé en base afin
 * que l'historique d'une étude ne bouge pas si le référentiel évolue.
 */
export const checklistItems = sqliteTable(
  "checklist_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    referentiel: text("referentiel").notNull(),
    itemCle: text("item_cle").notNull(),
    titre: text("titre").notNull(),
    description: text("description"),
    /** Texte réglementaire de référence, cité tel quel. */
    reference: text("reference"),
    /** conception | soumission | mise_en_place | conduite | cloture */
    phase: text("phase").notNull().default("conduite"),
    obligatoire: integer("obligatoire", { mode: "boolean" }).notNull().default(true),
    fait: integer("fait", { mode: "boolean" }).notNull().default(false),
    /** Marqué sans objet pour cette étude : ni fait, ni bloquant. */
    sansObjet: integer("sans_objet", { mode: "boolean" }).notNull().default(false),
    faitLe: integer("fait_le"),
    notes: text("notes"),
    ordre: integer("ordre").notNull().default(0),
  },
  (t) => [
    index("idx_checklist_etude").on(t.etudeId),
    index("idx_checklist_ref").on(t.referentiel),
  ],
);

/**
 * Base de connaissance. Une entrée sans etudeId est une FAQ générale,
 * valable pour toutes les études.
 */
export const faq = sqliteTable(
  "faq",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Propriétaire : seul lui, et les personnes conviées, y ont accès. */
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    etudeId: integer("etude_id").references(() => etudes.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    reponse: text("reponse").notNull(),
    categorie: text("categorie").notNull().default("general"),
    ordre: integer("ordre").notNull().default(0),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [index("idx_faq_etude").on(t.etudeId)],
);

/**
 * Une visite de monitorage. Le cœur du travail d'ARC : on planifie, on
 * réalise, on rédige un rapport, on envoie une lettre de suivi, on clôt.
 *
 * Aucune donnée de participant n'y figure — on suit le déroulé de la visite,
 * pas ce qu'on y a vu du dossier d'un patient.
 */
export const visites = sqliteTable(
  "visites",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Propriétaire : seul lui, et les personnes conviées, y ont accès. */
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    etudeId: integer("etude_id").references(() => etudes.id, { onDelete: "cascade" }),
    // "mise_en_place" | "routine" | "cloture" | "declenchee" | "a_distance"
    type: text("type").notNull().default("routine"),
    /** Centre investigateur visité : nom ou numéro, tel qu'il est désigné. */
    centre: text("centre"),
    /** Qui conduit la visite. Souvent soi, parfois un collègue ou un prestataire. */
    monitorNom: text("monitor_nom"),
    datePrevue: integer("date_prevue"),
    dateRealisee: integer("date_realisee"),
    // "planifiee" | "realisee" | "rapport_redige" | "lettre_envoyee" | "cloturee" | "annulee"
    statut: text("statut").notNull().default("planifiee"),
    /** Date d'envoi de la lettre de suivi : le délai contractuel court dessus. */
    lettreEnvoyeeLe: integer("lettre_envoyee_le"),
    notes: text("notes"),
    centreId: integer("centre_id"),
    dureeMinutes: integer("duree_minutes"),
    rapport: text("rapport"),
    arcId: integer("arc_id").references(() => utilisateurs.id, { onDelete: "set null" }),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [
    index("idx_visites_etude").on(t.etudeId),
    index("idx_visites_statut").on(t.statut),
    index("idx_visites_centre").on(t.centreId),
  ],
);

export type Visite = typeof visites.$inferSelect;

/**
 * Un écart au protocole, ou à une procédure. Constaté en visite ou en dehors.
 *
 * On décrit ce qui n'a pas été fait comme prévu — pas qui en a fait l'objet.
 */
export const ecarts = sqliteTable(
  "ecarts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Propriétaire : seul lui, et les personnes conviées, y ont accès. */
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    etudeId: integer("etude_id").references(() => etudes.id, { onDelete: "cascade" }),
    /**
     * Visite lors de laquelle l'écart a été relevé, s'il y en a une. Supprimer
     * la visite ne supprime pas l'écart : il garde sa valeur propre.
     */
    visiteId: integer("visite_id").references(() => visites.id, { onDelete: "set null" }),
    /** Référence interne, telle qu'elle figure au rapport de monitorage. */
    reference: text("reference"),
    titre: text("titre").notNull(),
    description: text("description"),
    centre: text("centre"),
    // "protocole" | "consentement" | "produit" | "donnees" | "procedure" | "autre"
    categorie: text("categorie").notNull().default("protocole"),
    // "mineur" | "majeur" | "critique"
    gravite: text("gravite").notNull().default("mineur"),
    dateConstat: integer("date_constat"),
    // "ouvert" | "en_cours" | "clos"
    statut: text("statut").notNull().default("ouvert"),
    dateCloture: integer("date_cloture"),
    sujetId: integer("sujet_id"),
    impact: text("impact"),
    actionCorrective: text("action_corrective"),
    actionPreventive: text("action_preventive"),
    responsableId: integer("responsable_id").references(() => utilisateurs.id, {
      onDelete: "set null",
    }),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [
    index("idx_ecarts_etude").on(t.etudeId),
    index("idx_ecarts_statut").on(t.statut),
    index("idx_ecarts_visite").on(t.visiteId),
    index("idx_ecarts_sujet").on(t.sujetId),
  ],
);

export type Ecart = typeof ecarts.$inferSelect;

/**
 * Une action corrective ou préventive. Un même écart en appelle souvent
 * plusieurs — d'où une table à part plutôt que des champs sur l'écart.
 *
 * Une action peut aussi exister seule : toutes ne naissent pas d'un écart
 * constaté, certaines viennent d'un audit ou d'une revue.
 */
export const actionsCorrectives = sqliteTable(
  "actions_correctives",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Propriétaire : seul lui, et les personnes conviées, y ont accès. */
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    etudeId: integer("etude_id").references(() => etudes.id, { onDelete: "cascade" }),
    /** Écart à l'origine de l'action. Nul si elle vient d'ailleurs. */
    ecartId: integer("ecart_id").references(() => ecarts.id, { onDelete: "cascade" }),
    // "corrective" | "preventive"
    nature: text("nature").notNull().default("corrective"),
    titre: text("titre").notNull(),
    description: text("description"),
    /** Qui porte l'action. Du texte libre : ce n'est pas toujours un compte. */
    responsable: text("responsable"),
    echeance: integer("echeance"),
    // "a_faire" | "en_cours" | "faite" | "verifiee" | "abandonnee"
    statut: text("statut").notNull().default("a_faire"),
    /**
     * Vérification de l'efficacité : une action faite n'est close qu'une fois
     * qu'on a constaté qu'elle produisait l'effet attendu.
     */
    efficacite: text("efficacite"),
    dateCloture: integer("date_cloture"),
    origine: text("origine"),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [
    index("idx_capa_etude").on(t.etudeId),
    index("idx_capa_statut").on(t.statut),
    index("idx_capa_ecart").on(t.ecartId),
  ],
);

export type ActionCorrective = typeof actionsCorrectives.$inferSelect;

/**
 * Une convention, un avenant ou un contrat rattaché à une étude.
 *
 * Le suivi financier tient en deux montants : ce qui est prévu et ce qui est
 * arrivé. Le reste à percevoir s'en déduit — inutile d'une table de versements
 * tant qu'on ne suit pas chaque échéance séparément.
 */
export const conventions = sqliteTable(
  "conventions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Propriétaire : seul lui, et les personnes conviées, y ont accès. */
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    etudeId: integer("etude_id").references(() => etudes.id, { onDelete: "cascade" }),
    /** Convention initiale dont ce document est l'avenant, le cas échéant. */
    parentId: integer("parent_id"),
    // "convention" | "avenant" | "cta" | "autre"
    type: text("type").notNull().default("convention"),
    reference: text("reference"),
    /** Avec qui elle est passée : promoteur, CRO, centre associé… */
    partie: text("partie"),
    /** Montants en euros. `real` suffit : on suit des budgets, pas des écritures comptables. */
    montantTotal: real("montant_total"),
    montantRecu: real("montant_recu").notNull().default(0),
    dateSignature: integer("date_signature"),
    /** Échéance de la dernière facturation attendue. */
    dateEcheance: integer("date_echeance"),
    // "en_negociation" | "signee" | "en_cours" | "soldee" | "annulee"
    statut: text("statut").notNull().default("en_negociation"),
    notes: text("notes"),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [
    index("idx_conventions_etude").on(t.etudeId),
    index("idx_conventions_statut").on(t.statut),
  ],
);

export type Convention = typeof conventions.$inferSelect;

/**
 * Un partage : une personne conviée sur une ressource dont elle n'est pas
 * propriétaire. Partager une étude donne accès à tout ce qui s'y rattache —
 * missions, documents, pages, FAQ, temps.
 */
export const partages = sqliteTable(
  "partages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    // "etude" | "page" | "tache"
    type: text("type").notNull(),
    ressourceId: integer("ressource_id").notNull(),
    utilisateurId: integer("utilisateur_id")
      .notNull()
      .references(() => utilisateurs.id, { onDelete: "cascade" }),
    // "lecture" | "ecriture"
    niveau: text("niveau").notNull().default("lecture"),
    /** Qui a convié. Sert à retracer l'origine d'un accès. */
    partagePar: integer("partage_par").references(() => utilisateurs.id, {
      onDelete: "set null",
    }),
    creeLe: integer("cree_le").notNull().default(maintenant),
  },
  (t) => [
    index("idx_partages_beneficiaire").on(t.utilisateurId, t.type),
    // Une personne n'est conviée qu'une fois sur une même ressource : un
    // second partage remplace le niveau plutôt que d'empiler des lignes.
    uniqueIndex("idx_partages_unicite").on(t.type, t.ressourceId, t.utilisateurId),
  ],
);

/**
 * Une invitation à rejoindre l'instance. Faute de serveur de courrier, le
 * lien est remis de la main à la main : le propriétaire le copie et l'envoie
 * par ses propres moyens.
 */
export const invitations = sqliteTable("invitations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Aléa signant le lien d'invitation. */
  jeton: text("jeton").notNull().unique(),
  email: text("email").notNull(),
  // "arc" | "tec" | "cp" | "autre"
  role: text("role").notNull().default("autre"),
  inviteePar: integer("invitee_par").references(() => utilisateurs.id, {
    onDelete: "cascade",
  }),
  expireLe: integer("expire_le").notNull(),
  /** Renseigné à l'usage : une invitation ne sert qu'une fois. */
  utiliseeLe: integer("utilisee_le"),
  creeLe: integer("cree_le").notNull().default(maintenant),
});

/**
 * Membre d'une étude, avec un rôle local. Complète le partage historique :
 * le propriétaire reste dans `etudes.proprietaire_id`, les invités simples
 * dans `partages`, l'équipe nominative ici.
 */
export const membresEtude = sqliteTable(
  "membres_etude",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    utilisateurId: integer("utilisateur_id")
      .notNull()
      .references(() => utilisateurs.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("lecture_seule"),
    creeLe: integer("cree_le").notNull().default(maintenant),
  },
  (t) => [uniqueIndex("idx_membres_unicite").on(t.etudeId, t.utilisateurId)],
);

/**
 * Centre investigateur rattaché à une étude. Plus un champ texte : une
 * entité, des inclusions, un risque, un calendrier de monitoring.
 */
export const centres = sqliteTable(
  "centres",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    numero: text("numero").notNull(),
    nom: text("nom").notNull(),
    etablissement: text("etablissement"),
    investigateurPrincipal: text("investigateur_principal"),
    investigateurId: integer("investigateur_id").references(() => utilisateurs.id, {
      onDelete: "set null",
    }),
    email: text("email"),
    telephone: text("telephone"),
    adresse: text("adresse"),
    // "en_selection" | "en_mise_en_place" | "actif" | "suspendu" | "ferme"
    statut: text("statut").notNull().default("en_selection"),
    dateActivation: integer("date_activation"),
    dateFermeture: integer("date_fermeture"),
    objectifInclusion: integer("objectif_inclusion"),
    // "faible" | "modere" | "eleve"
    risque: text("risque").notNull().default("modere"),
    notes: text("notes"),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [
    index("idx_centres_etude").on(t.etudeId),
    uniqueIndex("idx_centres_numero").on(t.etudeId, t.numero),
  ],
);

/**
 * Visite protocolaire type (screening, J0, V1…). Le calendrier réel des
 * sujets est instancié dans `visites_sujet`.
 */
export const modelesVisite = sqliteTable(
  "modeles_visite",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    nom: text("nom").notNull(),
    ordre: integer("ordre").notNull().default(0),
    // "screening" | "inclusion" | "traitement" | "fin_traitement" | "suivi" | "autre"
    type: text("type").notNull().default("traitement"),
    fenetreMinJours: integer("fenetre_min_jours"),
    fenetreMaxJours: integer("fenetre_max_jours"),
    description: text("description"),
  },
  (t) => [index("idx_modeles_visite_etude").on(t.etudeId)],
);

/**
 * Sujet d'étude. Identifié par un Subject ID — pas de nom, pas de date de
 * naissance, pas d'identifiant national. Les données nominatives n'ont
 * pas vocation à entrer ici.
 */
export const sujets = sqliteTable(
  "sujets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    centreId: integer("centre_id").references(() => centres.id, { onDelete: "set null" }),
    subjectId: text("subject_id").notNull(),
    // "pre_screening" | "screening" | "inclus" | "screen_failure" | "en_cours" |
    // "fin_traitement" | "suivi" | "termine" | "sortie_etude"
    statut: text("statut").notNull().default("screening"),
    dateScreening: integer("date_screening"),
    dateInclusion: integer("date_inclusion"),
    bras: text("bras"),
    // "a_jour" | "en_retard" | "queries_ouvertes" | "a_revoir"
    statutDonnees: text("statut_donnees").notNull().default("a_jour"),
    notes: text("notes"),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [
    index("idx_sujets_etude").on(t.etudeId),
    index("idx_sujets_centre").on(t.centreId),
    uniqueIndex("idx_sujets_code").on(t.etudeId, t.subjectId),
  ],
);

export const visitesSujet = sqliteTable(
  "visites_sujet",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    sujetId: integer("sujet_id")
      .notNull()
      .references(() => sujets.id, { onDelete: "cascade" }),
    centreId: integer("centre_id").references(() => centres.id, { onDelete: "set null" }),
    modeleId: integer("modele_id").references(() => modelesVisite.id, {
      onDelete: "set null",
    }),
    nom: text("nom").notNull(),
    datePrevue: integer("date_prevue"),
    dateReelle: integer("date_reelle"),
    // "prevue" | "confirmee" | "realisee" | "annulee" | "en_retard"
    statut: text("statut").notNull().default("prevue"),
    notes: text("notes"),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [
    index("idx_visites_sujet_etude").on(t.etudeId),
    index("idx_visites_sujet_sujet").on(t.sujetId),
    index("idx_visites_sujet_statut").on(t.statut),
    index("idx_visites_sujet_date").on(t.datePrevue),
  ],
);

export const plansDataManagement = sqliteTable(
  "plans_data_management",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    version: text("version").notNull(),
    datePlan: integer("date_plan"),
    responsableId: integer("responsable_id").references(() => utilisateurs.id, {
      onDelete: "set null",
    }),
    // "brouillon" | "en_revue" | "valide" | "obsolete"
    statut: text("statut").notNull().default("brouillon"),
    valideLe: integer("valide_le"),
    validePar: integer("valide_par").references(() => utilisateurs.id, { onDelete: "set null" }),
    notes: text("notes"),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [index("idx_dmp_etude").on(t.etudeId)],
);

export const formulairesCrf = sqliteTable(
  "formulaires_crf",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    nom: text("nom").notNull(),
    ordre: integer("ordre").notNull().default(0),
    description: text("description"),
  },
  (t) => [index("idx_crf_etude").on(t.etudeId)],
);

export const sectionsCrf = sqliteTable(
  "sections_crf",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    formulaireId: integer("formulaire_id")
      .notNull()
      .references(() => formulairesCrf.id, { onDelete: "cascade" }),
    nom: text("nom").notNull(),
    ordre: integer("ordre").notNull().default(0),
  },
  (t) => [index("idx_sections_crf_form").on(t.formulaireId)],
);

export const variablesCrf = sqliteTable(
  "variables_crf",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sectionId: integer("section_id")
      .notNull()
      .references(() => sectionsCrf.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    nom: text("nom").notNull(),
    // "texte" | "nombre" | "date" | "booleen" | "choix" | "liste"
    type: text("type").notNull().default("texte"),
    obligatoire: integer("obligatoire", { mode: "boolean" }).notNull().default(false),
    min: real("min"),
    max: real("max"),
    /** JSON : liste de valeurs autorisées pour un champ à choix. */
    valeursAutorisees: text("valeurs_autorisees"),
    contrainte: text("contrainte"),
    ordre: integer("ordre").notNull().default(0),
  },
  (t) => [index("idx_variables_section").on(t.sectionId)],
);

export const valeursCrf = sqliteTable(
  "valeurs_crf",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    visiteSujetId: integer("visite_sujet_id")
      .notNull()
      .references(() => visitesSujet.id, { onDelete: "cascade" }),
    variableId: integer("variable_id")
      .notNull()
      .references(() => variablesCrf.id, { onDelete: "cascade" }),
    valeur: text("valeur"),
    // "vide" | "saisie" | "a_revoir" | "verrouilee"
    statut: text("statut").notNull().default("vide"),
    saisiPar: integer("saisi_par").references(() => utilisateurs.id, { onDelete: "set null" }),
    saisiLe: integer("saisi_le"),
  },
  (t) => [
    uniqueIndex("idx_valeurs_unicite").on(t.visiteSujetId, t.variableId),
    index("idx_valeurs_statut").on(t.statut),
  ],
);

export const queries = sqliteTable(
  "queries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    code: text("code").notNull(),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    centreId: integer("centre_id").references(() => centres.id, { onDelete: "set null" }),
    sujetId: integer("sujet_id").references(() => sujets.id, { onDelete: "set null" }),
    visiteSujetId: integer("visite_sujet_id").references(() => visitesSujet.id, {
      onDelete: "set null",
    }),
    formulaireId: integer("formulaire_id").references(() => formulairesCrf.id, {
      onDelete: "set null",
    }),
    variableId: integer("variable_id").references(() => variablesCrf.id, {
      onDelete: "set null",
    }),
    // "manquant" | "incoherent" | "aberrant" | "clarification" | "autre"
    type: text("type").notNull().default("clarification"),
    description: text("description").notNull(),
    // "open" | "answered" | "reopened" | "resolved" | "closed"
    statut: text("statut").notNull().default("open"),
    auteurId: integer("auteur_id").references(() => utilisateurs.id, { onDelete: "set null" }),
    reponse: text("reponse"),
    reponduPar: integer("repondu_par").references(() => utilisateurs.id, {
      onDelete: "set null",
    }),
    reponduLe: integer("repondu_le"),
    resoluPar: integer("resolu_par").references(() => utilisateurs.id, { onDelete: "set null" }),
    resoluLe: integer("resolu_le"),
    fermeLe: integer("ferme_le"),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [
    uniqueIndex("idx_queries_code").on(t.etudeId, t.code),
    index("idx_queries_etude").on(t.etudeId),
    index("idx_queries_statut").on(t.statut),
    index("idx_queries_sujet").on(t.sujetId),
    index("idx_queries_centre").on(t.centreId),
  ],
);

export const evenementsQuery = sqliteTable(
  "evenements_query",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    queryId: integer("query_id")
      .notNull()
      .references(() => queries.id, { onDelete: "cascade" }),
    auteurId: integer("auteur_id").references(() => utilisateurs.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    ancienStatut: text("ancien_statut"),
    nouveauStatut: text("nouveau_statut"),
    commentaire: text("commentaire"),
    creeLe: integer("cree_le").notNull().default(maintenant),
  },
  (t) => [index("idx_evenements_query").on(t.queryId)],
);

export const revuesDonnees = sqliteTable(
  "revues_donnees",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    sujetId: integer("sujet_id").references(() => sujets.id, { onDelete: "set null" }),
    visiteSujetId: integer("visite_sujet_id").references(() => visitesSujet.id, {
      onDelete: "set null",
    }),
    variableId: integer("variable_id").references(() => variablesCrf.id, {
      onDelete: "set null",
    }),
    // "manquant" | "incoherent" | "aberrant" | "manuel"
    type: text("type").notNull().default("manquant"),
    // "a_faire" | "en_cours" | "fait" | "ignore"
    statut: text("statut").notNull().default("a_faire"),
    description: text("description").notNull(),
    assigneeId: integer("assignee_id").references(() => utilisateurs.id, {
      onDelete: "set null",
    }),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [index("idx_revues_etude").on(t.etudeId), index("idx_revues_statut").on(t.statut)],
);

/**
 * Terme à coder. L'architecture existe ; aucun dictionnaire propriétaire
 * (MedDRA, WhoDrug, etc.) n'est fourni avec l'outil.
 */
export const codages = sqliteTable(
  "codages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    sujetId: integer("sujet_id").references(() => sujets.id, { onDelete: "set null" }),
    // "medicament" | "evenement" | "pathologie" | "autre"
    type: text("type").notNull().default("evenement"),
    termeSource: text("terme_source").notNull(),
    code: text("code"),
    dictionnaire: text("dictionnaire"),
    versionDictionnaire: text("version_dictionnaire"),
    // "a_coder" | "code" | "a_revoir"
    statut: text("statut").notNull().default("a_coder"),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [index("idx_codages_etude").on(t.etudeId)],
);

export const itemsChecklistMonitoring = sqliteTable(
  "items_checklist_monitoring",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    cle: text("cle").notNull(),
    libelle: text("libelle").notNull(),
    categorie: text("categorie").notNull().default("general"),
    ordre: integer("ordre").notNull().default(0),
    actif: integer("actif", { mode: "boolean" }).notNull().default(true),
  },
  (t) => [index("idx_chk_mon_etude").on(t.etudeId)],
);

export const resultatsChecklistMonitoring = sqliteTable(
  "resultats_checklist_monitoring",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    visiteId: integer("visite_id")
      .notNull()
      .references(() => visites.id, { onDelete: "cascade" }),
    itemId: integer("item_id")
      .notNull()
      .references(() => itemsChecklistMonitoring.id, { onDelete: "cascade" }),
    // "ok" | "nc" | "na" | "a_verifier"
    statut: text("statut").notNull().default("a_verifier"),
    notes: text("notes"),
  },
  (t) => [uniqueIndex("idx_res_chk_unicite").on(t.visiteId, t.itemId)],
);

export const jalons = sqliteTable(
  "jalons",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    nom: text("nom").notNull(),
    // "inclusion" | "suivi" | "gel_base" | "fin_etude" | "soumission" | "autre"
    type: text("type").notNull().default("autre"),
    datePrevue: integer("date_prevue"),
    dateReelle: integer("date_reelle"),
    // "a_venir" | "atteint" | "en_retard" | "annule"
    statut: text("statut").notNull().default("a_venir"),
    description: text("description"),
    responsableId: integer("responsable_id").references(() => utilisateurs.id, {
      onDelete: "set null",
    }),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [index("idx_jalons_etude").on(t.etudeId), index("idx_jalons_date").on(t.datePrevue)],
);

export const reunions = sqliteTable(
  "reunions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    etudeId: integer("etude_id").references(() => etudes.id, { onDelete: "cascade" }),
    titre: text("titre").notNull(),
    dateDebut: integer("date_debut").notNull(),
    dateFin: integer("date_fin"),
    type: text("type").notNull().default("reunion"),
    notes: text("notes"),
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    creeLe: integer("cree_le").notNull().default(maintenant),
  },
  (t) => [index("idx_reunions_date").on(t.dateDebut)],
);

/**
 * Suivi d'événements de sécurité. Outil de projet, pas une base de
 * pharmacovigilance réglementaire : pas de génération de CIOMS, pas de
 * déclaration SUSAR automatisée.
 */
export const evenementsIndesirables = sqliteTable(
  "evenements_indesirables",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    proprietaireId: integer("proprietaire_id").references(() => utilisateurs.id, {
      onDelete: "cascade",
    }),
    etudeId: integer("etude_id")
      .notNull()
      .references(() => etudes.id, { onDelete: "cascade" }),
    centreId: integer("centre_id").references(() => centres.id, { onDelete: "set null" }),
    sujetId: integer("sujet_id").references(() => sujets.id, { onDelete: "set null" }),
    code: text("code").notNull(),
    // "ae" | "sae" | "susar"
    type: text("type").notNull().default("ae"),
    terme: text("terme").notNull(),
    dateDebut: integer("date_debut"),
    dateFin: integer("date_fin"),
    gravite: text("gravite"),
    seriousness: text("seriousness"),
    expectedness: text("expectedness"),
    causalite: text("causalite"),
    // "en_cours" | "resolu" | "en_suivi" | "fatal"
    statut: text("statut").notNull().default("en_cours"),
    description: text("description"),
    creeLe: integer("cree_le").notNull().default(maintenant),
    modifieLe: integer("modifie_le").notNull().default(maintenant),
  },
  (t) => [index("idx_ei_etude").on(t.etudeId), index("idx_ei_sujet").on(t.sujetId)],
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    utilisateurId: integer("utilisateur_id")
      .notNull()
      .references(() => utilisateurs.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    titre: text("titre").notNull(),
    message: text("message"),
    lien: text("lien"),
    lu: integer("lu", { mode: "boolean" }).notNull().default(false),
    objetType: text("objet_type"),
    objetId: integer("objet_id"),
    creeLe: integer("cree_le").notNull().default(maintenant),
  },
  (t) => [
    index("idx_notif_user").on(t.utilisateurId, t.lu),
    index("idx_notif_objet").on(t.utilisateurId, t.type, t.objetType, t.objetId),
  ],
);

/**
 * Journal d'audit. Les lignes ne sont jamais mises à jour ni supprimées par
 * les actions métier : un utilisateur standard ne peut pas réécrire l'histoire.
 */
export const journauxAudit = sqliteTable(
  "journaux_audit",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    utilisateurId: integer("utilisateur_id").references(() => utilisateurs.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    objetType: text("objet_type").notNull(),
    objetId: integer("objet_id"),
    etudeId: integer("etude_id"),
    ancienneValeur: text("ancienne_valeur"),
    nouvelleValeur: text("nouvelle_valeur"),
    creeLe: integer("cree_le").notNull().default(maintenant),
  },
  (t) => [
    index("idx_audit_objet").on(t.objetType, t.objetId),
    index("idx_audit_etude").on(t.etudeId),
    index("idx_audit_date").on(t.creeLe),
  ],
);

export const parametresApp = sqliteTable("parametres_app", {
  cle: text("cle").primaryKey(),
  valeur: text("valeur").notNull(),
  modifieLe: integer("modifie_le").notNull().default(maintenant),
});

export type Partage = typeof partages.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type Etude = typeof etudes.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Tache = typeof taches.$inferSelect;
export type Temps = typeof temps.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type Faq = typeof faq.$inferSelect;
export type MembreEtude = typeof membresEtude.$inferSelect;
export type Centre = typeof centres.$inferSelect;
export type ModeleVisite = typeof modelesVisite.$inferSelect;
export type Sujet = typeof sujets.$inferSelect;
export type VisiteSujet = typeof visitesSujet.$inferSelect;
export type PlanDataManagement = typeof plansDataManagement.$inferSelect;
export type FormulaireCrf = typeof formulairesCrf.$inferSelect;
export type Query = typeof queries.$inferSelect;
export type EvenementQuery = typeof evenementsQuery.$inferSelect;
export type RevueDonnees = typeof revuesDonnees.$inferSelect;
export type Codage = typeof codages.$inferSelect;
export type Jalon = typeof jalons.$inferSelect;
export type EvenementIndesirable = typeof evenementsIndesirables.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type JournalAudit = typeof journauxAudit.$inferSelect;
