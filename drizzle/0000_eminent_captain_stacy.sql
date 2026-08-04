CREATE TABLE `etudes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nom` text NOT NULL,
	`client` text,
	`description` text,
	`couleur` text DEFAULT '#6366f1' NOT NULL,
	`statut` text DEFAULT 'active' NOT NULL,
	`tarif_horaire` real,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer,
	`parent_id` integer,
	`titre` text DEFAULT 'Sans titre' NOT NULL,
	`icone` text DEFAULT '📄' NOT NULL,
	`contenu` text DEFAULT '[]' NOT NULL,
	`ordre` integer DEFAULT 0 NOT NULL,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_pages_etude` ON `pages` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_pages_parent` ON `pages` (`parent_id`);--> statement-breakpoint
CREATE TABLE `taches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer,
	`titre` text NOT NULL,
	`notes` text,
	`statut` text DEFAULT 'a_faire' NOT NULL,
	`priorite` text DEFAULT 'normale' NOT NULL,
	`echeance` integer,
	`ordre` integer DEFAULT 0 NOT NULL,
	`terminee_le` integer,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_taches_etude` ON `taches` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_taches_statut` ON `taches` (`statut`);--> statement-breakpoint
CREATE TABLE `temps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`etude_id` integer,
	`tache_id` integer,
	`description` text,
	`debut` integer NOT NULL,
	`fin` integer,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tache_id`) REFERENCES `taches`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_temps_etude` ON `temps` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_temps_debut` ON `temps` (`debut`);