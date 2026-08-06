import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
  // "arc" | "tec" | "cp" | "autre"
  role: text("role").notNull().default("autre"),
  /**
   * Clés des modules activés, en JSON : ["missions","documents","temps"].
   * Vide au départ : la sélection suggérée par le métier s'applique alors.
   */
  modules: text("modules"),
  /** Un compte désactivé conserve ses données mais ne peut plus se connecter. */
  actif: integer("actif", { mode: "boolean" }).notNull().default(true),
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
    etudeId: integer("etude_id").references(() => etudes.id, { onDelete: "cascade" }),
    titre: text("titre").notNull(),
    notes: text("notes"),
    // "a_faire" | "en_cours" | "terminee"
    statut: text("statut").notNull().default("a_faire"),
    // "basse" | "normale" | "haute"
    priorite: text("priorite").notNull().default("normale"),
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
    creeLe: integer("cree_le").notNull().default(maintenant),
  },
  (t) => [
    index("idx_documents_etude").on(t.etudeId),
    index("idx_documents_categorie").on(t.categorie),
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

export type Etude = typeof etudes.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Tache = typeof taches.$inferSelect;
export type Temps = typeof temps.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type Faq = typeof faq.$inferSelect;
