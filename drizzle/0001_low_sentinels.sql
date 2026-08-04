CREATE TABLE `checklist_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer NOT NULL,
	`referentiel` text NOT NULL,
	`item_cle` text NOT NULL,
	`titre` text NOT NULL,
	`description` text,
	`reference` text,
	`phase` text DEFAULT 'conduite' NOT NULL,
	`obligatoire` integer DEFAULT true NOT NULL,
	`fait` integer DEFAULT false NOT NULL,
	`sans_objet` integer DEFAULT false NOT NULL,
	`fait_le` integer,
	`notes` text,
	`ordre` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_checklist_etude` ON `checklist_items` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_checklist_ref` ON `checklist_items` (`referentiel`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer,
	`nom` text NOT NULL,
	`description` text,
	`categorie` text DEFAULT 'autre' NOT NULL,
	`version` text,
	`nom_fichier` text NOT NULL,
	`nom_original` text NOT NULL,
	`taille` integer DEFAULT 0 NOT NULL,
	`type_mime` text DEFAULT 'application/octet-stream' NOT NULL,
	`date_document` integer,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_documents_etude` ON `documents` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_documents_categorie` ON `documents` (`categorie`);--> statement-breakpoint
CREATE TABLE `faq` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer,
	`question` text NOT NULL,
	`reponse` text NOT NULL,
	`categorie` text DEFAULT 'general' NOT NULL,
	`ordre` integer DEFAULT 0 NOT NULL,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_faq_etude` ON `faq` (`etude_id`);--> statement-breakpoint
ALTER TABLE `etudes` ADD `code` text;--> statement-breakpoint
ALTER TABLE `etudes` ADD `image_couverture` text;--> statement-breakpoint
ALTER TABLE `etudes` ADD `promoteur` text;--> statement-breakpoint
ALTER TABLE `etudes` ADD `investigateur` text;--> statement-breakpoint
ALTER TABLE `etudes` ADD `reglementations` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `etudes` ADD `id_rcb` text;--> statement-breakpoint
ALTER TABLE `etudes` ADD `numero_ctis` text;--> statement-breakpoint
ALTER TABLE `etudes` ADD `numero_cpp` text;--> statement-breakpoint
ALTER TABLE `etudes` ADD `date_debut` integer;--> statement-breakpoint
ALTER TABLE `etudes` ADD `date_fin` integer;