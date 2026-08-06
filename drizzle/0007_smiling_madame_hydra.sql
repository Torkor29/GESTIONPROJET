CREATE TABLE `conventions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`proprietaire_id` integer,
	`etude_id` integer,
	`parent_id` integer,
	`type` text DEFAULT 'convention' NOT NULL,
	`reference` text,
	`partie` text,
	`montant_total` real,
	`montant_recu` real DEFAULT 0 NOT NULL,
	`date_signature` integer,
	`date_echeance` integer,
	`statut` text DEFAULT 'en_negociation' NOT NULL,
	`notes` text,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`proprietaire_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_conventions_etude` ON `conventions` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_conventions_statut` ON `conventions` (`statut`);