CREATE TABLE `tache_etudes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tache_id` integer NOT NULL,
	`etude_id` integer NOT NULL,
	`statut` text DEFAULT 'a_faire' NOT NULL,
	`notes` text,
	`terminee_le` integer,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`tache_id`) REFERENCES `taches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_tache_etudes_unicite` ON `tache_etudes` (`tache_id`,`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_tache_etudes_etude` ON `tache_etudes` (`etude_id`);--> statement-breakpoint
ALTER TABLE `taches` ADD `type` text;--> statement-breakpoint
ALTER TABLE `utilisateurs` ADD `acces_toutes_etudes` integer DEFAULT false NOT NULL;--> statement-breakpoint
-- Droit accordé d'emblée à Mathilde Donnart, assistante cheffe de projet : elle
-- porte des missions transverses sur toutes les études de l'installation.
-- Sans effet si son compte n'existe pas encore : l'administrateur l'accorde
-- alors depuis Paramètres › Équipe.
UPDATE `utilisateurs` SET `acces_toutes_etudes` = 1
  WHERE lower(`nom`) LIKE '%donnart%' OR lower(`email`) LIKE '%donnart%';
