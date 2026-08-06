CREATE TABLE `visites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`proprietaire_id` integer,
	`etude_id` integer,
	`type` text DEFAULT 'routine' NOT NULL,
	`centre` text,
	`monitor_nom` text,
	`date_prevue` integer,
	`date_realisee` integer,
	`statut` text DEFAULT 'planifiee' NOT NULL,
	`lettre_envoyee_le` integer,
	`notes` text,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`proprietaire_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_visites_etude` ON `visites` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_visites_statut` ON `visites` (`statut`);