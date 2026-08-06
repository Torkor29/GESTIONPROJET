CREATE TABLE `utilisateurs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`mot_de_passe` text NOT NULL,
	`nom` text NOT NULL,
	`role` text DEFAULT 'autre' NOT NULL,
	`actif` integer DEFAULT true NOT NULL,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	`derniere_connexion` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `utilisateurs_email_unique` ON `utilisateurs` (`email`);