CREATE TABLE `actions_correctives` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`proprietaire_id` integer,
	`etude_id` integer,
	`ecart_id` integer,
	`nature` text DEFAULT 'corrective' NOT NULL,
	`titre` text NOT NULL,
	`description` text,
	`responsable` text,
	`echeance` integer,
	`statut` text DEFAULT 'a_faire' NOT NULL,
	`efficacite` text,
	`date_cloture` integer,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`proprietaire_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ecart_id`) REFERENCES `ecarts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_capa_etude` ON `actions_correctives` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_capa_statut` ON `actions_correctives` (`statut`);--> statement-breakpoint
CREATE INDEX `idx_capa_ecart` ON `actions_correctives` (`ecart_id`);--> statement-breakpoint
CREATE TABLE `ecarts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`proprietaire_id` integer,
	`etude_id` integer,
	`visite_id` integer,
	`reference` text,
	`titre` text NOT NULL,
	`description` text,
	`centre` text,
	`categorie` text DEFAULT 'protocole' NOT NULL,
	`gravite` text DEFAULT 'mineur' NOT NULL,
	`date_constat` integer,
	`statut` text DEFAULT 'ouvert' NOT NULL,
	`date_cloture` integer,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`modifie_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`proprietaire_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`visite_id`) REFERENCES `visites`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_ecarts_etude` ON `ecarts` (`etude_id`);--> statement-breakpoint
CREATE INDEX `idx_ecarts_statut` ON `ecarts` (`statut`);--> statement-breakpoint
CREATE INDEX `idx_ecarts_visite` ON `ecarts` (`visite_id`);