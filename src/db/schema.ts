import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const maintenant = sql`(unixepoch())`;

/**
 * Une étude = un dossier de travail (un projet, un client, un chantier).
 * Tout le reste — pages, tâches, temps — s'y rattache.
 */
export const etudes = sqliteTable("etudes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nom: text("nom").notNull(),
  client: text("client"),
  description: text("description"),
  couleur: text("couleur").notNull().default("#6366f1"),
  // "active" | "en_pause" | "terminee" | "archivee"
  statut: text("statut").notNull().default("active"),
  // Tarif horaire optionnel, utilisé pour valoriser le temps à l'export.
  tarifHoraire: real("tarif_horaire"),
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

export type Etude = typeof etudes.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Tache = typeof taches.$inferSelect;
export type Temps = typeof temps.$inferSelect;
