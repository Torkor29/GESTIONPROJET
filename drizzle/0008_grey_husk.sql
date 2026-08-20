CREATE TABLE `centres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`proprietaire_id` integer,
	`etude_id` integer NOT NULL,
	`numero` text NOT NULL,
	`nom` text NOT NULL,
	`etablissement` text,
	`investigateur_principal` text,
	`investigateur_id` integer,
	`email` text,
	`telephone` text,
	`adresse` text,
	`statut` text DEFAULT 'en_selection' NOT NULL,
	`date_activation` integer,
	`date_fermeture` integer,
	`objectif_inclusion` integer,
	`risque` text DEFAULT 'modere' NOT NULL,
	`notes` text,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`proprietaire_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`investigateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_centres_etude` ON `centres` (`etude_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_centres_numero` ON `centres` (`etude_id`,`numero`);--> statement-breakpoint
CREATE TABLE `codages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer NOT NULL,
	`sujet_id` integer,
	`type` text DEFAULT 'evenement' NOT NULL,
	`terme_source` text NOT NULL,
	`code` text,
	`dictionnaire` text,
	`version_dictionnaire` text,
	`statut` text DEFAULT 'a_coder' NOT NULL,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sujet_id`) REFERENCES `sujets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_codages_etude` ON `codages` (`etude_id`);--> statement-breakpoint
CREATE TABLE `evenements_indesirables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`proprietaire_id` integer,
	`etude_id` integer NOT NULL,
	`centre_id` integer,
	`sujet_id` integer,
	`code` text NOT NULL,
	`type` text DEFAULT 'ae' NOT NULL,
	`terme` text NOT NULL,
	`date_debut` integer,
	`date_fin` integer,
	`gravite` text,
	`seriousness` text,
	`expectedness` text,
	`causalite` text,
	`statut` text DEFAULT 'en_cours' NOT NULL,
	`description` text,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`proprietaire_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`centre_id`) REFERENCES `centres`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`sujet_id`) REFERENCES `sujets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_ei_etude` ON `evenements_indesirables` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_ei_sujet` ON `evenements_indesirables` (`sujet_id`);--> statement-breakpoint
CREATE TABLE `evenements_query` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`query_id` integer NOT NULL,
	`auteur_id` integer,
	`action` text NOT NULL,
	`ancien_statut` text,
	`nouveau_statut` text,
	`commentaire` text,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`query_id`) REFERENCES `queries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`auteur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_evenements_query` ON `evenements_query` (`query_id`);--> statement-breakpoint
CREATE TABLE `formulaires_crf` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer NOT NULL,
	`code` text NOT NULL,
	`nom` text NOT NULL,
	`ordre` integer DEFAULT 0 NOT NULL,
	`description` text,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_crf_etude` ON `formulaires_crf` (`etude_id`);--> statement-breakpoint
CREATE TABLE `items_checklist_monitoring` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer NOT NULL,
	`cle` text NOT NULL,
	`libelle` text NOT NULL,
	`categorie` text DEFAULT 'general' NOT NULL,
	`ordre` integer DEFAULT 0 NOT NULL,
	`actif` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_chk_mon_etude` ON `items_checklist_monitoring` (`etude_id`);--> statement-breakpoint
CREATE TABLE `jalons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`proprietaire_id` integer,
	`etude_id` integer NOT NULL,
	`nom` text NOT NULL,
	`type` text DEFAULT 'autre' NOT NULL,
	`date_prevue` integer,
	`date_reelle` integer,
	`statut` text DEFAULT 'a_venir' NOT NULL,
	`description` text,
	`responsable_id` integer,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`proprietaire_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`responsable_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_jalons_etude` ON `jalons` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_jalons_date` ON `jalons` (`date_prevue`);--> statement-breakpoint
CREATE TABLE `journaux_audit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`utilisateur_id` integer,
	`action` text NOT NULL,
	`objet_type` text NOT NULL,
	`objet_id` integer,
	`etude_id` integer,
	`ancienne_valeur` text,
	`nouvelle_valeur` text,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_audit_objet` ON `journaux_audit` (`objet_type`,`objet_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_etude` ON `journaux_audit` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_date` ON `journaux_audit` (`cree_le`);--> statement-breakpoint
CREATE TABLE `membres_etude` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer NOT NULL,
	`utilisateur_id` integer NOT NULL,
	`role` text DEFAULT 'lecture_seule' NOT NULL,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_membres_unicite` ON `membres_etude` (`etude_id`,`utilisateur_id`);--> statement-breakpoint
CREATE TABLE `modeles_visite` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer NOT NULL,
	`code` text NOT NULL,
	`nom` text NOT NULL,
	`ordre` integer DEFAULT 0 NOT NULL,
	`type` text DEFAULT 'traitement' NOT NULL,
	`fenetre_min_jours` integer,
	`fenetre_max_jours` integer,
	`description` text,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_modeles_visite_etude` ON `modeles_visite` (`etude_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`utilisateur_id` integer NOT NULL,
	`type` text NOT NULL,
	`titre` text NOT NULL,
	`message` text,
	`lien` text,
	`lu` integer DEFAULT false NOT NULL,
	`objet_type` text,
	`objet_id` integer,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_notif_user` ON `notifications` (`utilisateur_id`,`lu`);--> statement-breakpoint
CREATE INDEX `idx_notif_objet` ON `notifications` (`utilisateur_id`,`type`,`objet_type`,`objet_id`);--> statement-breakpoint
CREATE TABLE `parametres_app` (
	`cle` text PRIMARY KEY NOT NULL,
	`valeur` text NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plans_data_management` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer NOT NULL,
	`version` text NOT NULL,
	`date_plan` integer,
	`responsable_id` integer,
	`statut` text DEFAULT 'brouillon' NOT NULL,
	`valide_le` integer,
	`valide_par` integer,
	`notes` text,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`responsable_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`valide_par`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_dmp_etude` ON `plans_data_management` (`etude_id`);--> statement-breakpoint
CREATE TABLE `queries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`proprietaire_id` integer,
	`code` text NOT NULL,
	`etude_id` integer NOT NULL,
	`centre_id` integer,
	`sujet_id` integer,
	`visite_sujet_id` integer,
	`formulaire_id` integer,
	`variable_id` integer,
	`type` text DEFAULT 'clarification' NOT NULL,
	`description` text NOT NULL,
	`statut` text DEFAULT 'open' NOT NULL,
	`auteur_id` integer,
	`reponse` text,
	`repondu_par` integer,
	`repondu_le` integer,
	`resolu_par` integer,
	`resolu_le` integer,
	`ferme_le` integer,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`proprietaire_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`centre_id`) REFERENCES `centres`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`sujet_id`) REFERENCES `sujets`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`visite_sujet_id`) REFERENCES `visites_sujet`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`formulaire_id`) REFERENCES `formulaires_crf`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`variable_id`) REFERENCES `variables_crf`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`auteur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`repondu_par`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`resolu_par`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_queries_code` ON `queries` (`etude_id`,`code`);--> statement-breakpoint
CREATE INDEX `idx_queries_etude` ON `queries` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_queries_statut` ON `queries` (`statut`);--> statement-breakpoint
CREATE INDEX `idx_queries_sujet` ON `queries` (`sujet_id`);--> statement-breakpoint
CREATE INDEX `idx_queries_centre` ON `queries` (`centre_id`);--> statement-breakpoint
CREATE TABLE `resultats_checklist_monitoring` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`visite_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`statut` text DEFAULT 'a_verifier' NOT NULL,
	`notes` text,
	FOREIGN KEY (`visite_id`) REFERENCES `visites`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `items_checklist_monitoring`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_res_chk_unicite` ON `resultats_checklist_monitoring` (`visite_id`,`item_id`);--> statement-breakpoint
CREATE TABLE `reunions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer,
	`titre` text NOT NULL,
	`date_debut` integer NOT NULL,
	`date_fin` integer,
	`type` text DEFAULT 'reunion' NOT NULL,
	`notes` text,
	`proprietaire_id` integer,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`proprietaire_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_reunions_date` ON `reunions` (`date_debut`);--> statement-breakpoint
CREATE TABLE `revues_donnees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer NOT NULL,
	`sujet_id` integer,
	`visite_sujet_id` integer,
	`variable_id` integer,
	`type` text DEFAULT 'manquant' NOT NULL,
	`statut` text DEFAULT 'a_faire' NOT NULL,
	`description` text NOT NULL,
	`assignee_id` integer,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sujet_id`) REFERENCES `sujets`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`visite_sujet_id`) REFERENCES `visites_sujet`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`variable_id`) REFERENCES `variables_crf`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`assignee_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_revues_etude` ON `revues_donnees` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_revues_statut` ON `revues_donnees` (`statut`);--> statement-breakpoint
CREATE TABLE `sections_crf` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`formulaire_id` integer NOT NULL,
	`nom` text NOT NULL,
	`ordre` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`formulaire_id`) REFERENCES `formulaires_crf`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_sections_crf_form` ON `sections_crf` (`formulaire_id`);--> statement-breakpoint
CREATE TABLE `sujets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`proprietaire_id` integer,
	`etude_id` integer NOT NULL,
	`centre_id` integer,
	`subject_id` text NOT NULL,
	`statut` text DEFAULT 'screening' NOT NULL,
	`date_screening` integer,
	`date_inclusion` integer,
	`bras` text,
	`statut_donnees` text DEFAULT 'a_jour' NOT NULL,
	`notes` text,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`proprietaire_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`centre_id`) REFERENCES `centres`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_sujets_etude` ON `sujets` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_sujets_centre` ON `sujets` (`centre_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_sujets_code` ON `sujets` (`etude_id`,`subject_id`);--> statement-breakpoint
CREATE TABLE `valeurs_crf` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`visite_sujet_id` integer NOT NULL,
	`variable_id` integer NOT NULL,
	`valeur` text,
	`statut` text DEFAULT 'vide' NOT NULL,
	`saisi_par` integer,
	`saisi_le` integer,
	FOREIGN KEY (`visite_sujet_id`) REFERENCES `visites_sujet`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variable_id`) REFERENCES `variables_crf`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`saisi_par`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_valeurs_unicite` ON `valeurs_crf` (`visite_sujet_id`,`variable_id`);--> statement-breakpoint
CREATE INDEX `idx_valeurs_statut` ON `valeurs_crf` (`statut`);--> statement-breakpoint
CREATE TABLE `variables_crf` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`section_id` integer NOT NULL,
	`code` text NOT NULL,
	`nom` text NOT NULL,
	`type` text DEFAULT 'texte' NOT NULL,
	`obligatoire` integer DEFAULT false NOT NULL,
	`min` real,
	`max` real,
	`valeurs_autorisees` text,
	`contrainte` text,
	`ordre` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `sections_crf`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_variables_section` ON `variables_crf` (`section_id`);--> statement-breakpoint
CREATE TABLE `visites_sujet` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer NOT NULL,
	`sujet_id` integer NOT NULL,
	`centre_id` integer,
	`modele_id` integer,
	`nom` text NOT NULL,
	`date_prevue` integer,
	`date_reelle` integer,
	`statut` text DEFAULT 'prevue' NOT NULL,
	`notes` text,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sujet_id`) REFERENCES `sujets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`centre_id`) REFERENCES `centres`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`modele_id`) REFERENCES `modeles_visite`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_visites_sujet_etude` ON `visites_sujet` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_visites_sujet_sujet` ON `visites_sujet` (`sujet_id`);--> statement-breakpoint
CREATE INDEX `idx_visites_sujet_statut` ON `visites_sujet` (`statut`);--> statement-breakpoint
CREATE INDEX `idx_visites_sujet_date` ON `visites_sujet` (`date_prevue`);--> statement-breakpoint
ALTER TABLE `actions_correctives` ADD `origine` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `statut` text DEFAULT 'en_vigueur' NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `confidentialite` text DEFAULT 'interne' NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `expiration` integer;--> statement-breakpoint
ALTER TABLE `documents` ADD `zone` text DEFAULT 'tmf_central' NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `centre_id` integer;--> statement-breakpoint
CREATE INDEX `idx_documents_expiration` ON `documents` (`expiration`);--> statement-breakpoint
ALTER TABLE `ecarts` ADD `sujet_id` integer;--> statement-breakpoint
ALTER TABLE `ecarts` ADD `impact` text;--> statement-breakpoint
ALTER TABLE `ecarts` ADD `action_corrective` text;--> statement-breakpoint
ALTER TABLE `ecarts` ADD `action_preventive` text;--> statement-breakpoint
ALTER TABLE `ecarts` ADD `responsable_id` integer REFERENCES utilisateurs(id);--> statement-breakpoint
CREATE INDEX `idx_ecarts_sujet` ON `ecarts` (`sujet_id`);--> statement-breakpoint
ALTER TABLE `etudes` ADD `phase` text;--> statement-breakpoint
ALTER TABLE `etudes` ADD `indication` text;--> statement-breakpoint
ALTER TABLE `etudes` ADD `population_cible` text;--> statement-breakpoint
ALTER TABLE `etudes` ADD `nb_centres_prevu` integer;--> statement-breakpoint
ALTER TABLE `etudes` ADD `nb_sujets_prevu` integer;--> statement-breakpoint
ALTER TABLE `etudes` ADD `chef_projet_id` integer REFERENCES utilisateurs(id);--> statement-breakpoint
ALTER TABLE `etudes` ADD `arc_referent_id` integer REFERENCES utilisateurs(id);--> statement-breakpoint
ALTER TABLE `etudes` ADD `data_manager_id` integer REFERENCES utilisateurs(id);--> statement-breakpoint
ALTER TABLE `etudes` ADD `version_protocole` text;--> statement-breakpoint
ALTER TABLE `etudes` ADD `est_demo` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `etudes` ADD `onboarding_etape` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `taches` ADD `assignee_id` integer REFERENCES utilisateurs(id);--> statement-breakpoint
ALTER TABLE `taches` ADD `source` text;--> statement-breakpoint
ALTER TABLE `taches` ADD `objet_type` text;--> statement-breakpoint
ALTER TABLE `taches` ADD `objet_id` integer;--> statement-breakpoint
ALTER TABLE `utilisateurs` ADD `super_admin` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `utilisateurs` ADD `est_demo` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `visites` ADD `centre_id` integer;--> statement-breakpoint
ALTER TABLE `visites` ADD `duree_minutes` integer;--> statement-breakpoint
ALTER TABLE `visites` ADD `rapport` text;--> statement-breakpoint
ALTER TABLE `visites` ADD `arc_id` integer REFERENCES utilisateurs(id);--> statement-breakpoint
CREATE INDEX `idx_visites_centre` ON `visites` (`centre_id`);