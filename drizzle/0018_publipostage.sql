CREATE TABLE `publipostages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`proprietaire_id` integer,
	`etude_id` integer,
	`modele` text NOT NULL,
	`titre` text NOT NULL,
	`valeurs` text DEFAULT '{}' NOT NULL,
	`statut` text DEFAULT 'brouillon' NOT NULL,
	`destinataire` text,
	`envoye_le` integer,
	`retour_le` integer,
	`notes` text,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`proprietaire_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_publipostages_etude` ON `publipostages` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_publipostages_statut` ON `publipostages` (`statut`);