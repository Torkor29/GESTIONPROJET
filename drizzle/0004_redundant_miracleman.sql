CREATE TABLE `invitations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`jeton` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'autre' NOT NULL,
	`invitee_par` integer,
	`expire_le` integer NOT NULL,
	`utilisee_le` integer,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`invitee_par`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_jeton_unique` ON `invitations` (`jeton`);--> statement-breakpoint
CREATE TABLE `partages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`ressource_id` integer NOT NULL,
	`utilisateur_id` integer NOT NULL,
	`niveau` text DEFAULT 'lecture' NOT NULL,
	`partage_par` integer,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`partage_par`) REFERENCES `utilisateurs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_partages_beneficiaire` ON `partages` (`utilisateur_id`,`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_partages_unicite` ON `partages` (`type`,`ressource_id`,`utilisateur_id`);--> statement-breakpoint
ALTER TABLE `documents` ADD `proprietaire_id` integer REFERENCES utilisateurs(id);--> statement-breakpoint
ALTER TABLE `etudes` ADD `proprietaire_id` integer REFERENCES utilisateurs(id);--> statement-breakpoint
ALTER TABLE `faq` ADD `proprietaire_id` integer REFERENCES utilisateurs(id);--> statement-breakpoint
ALTER TABLE `pages` ADD `proprietaire_id` integer REFERENCES utilisateurs(id);--> statement-breakpoint
ALTER TABLE `taches` ADD `proprietaire_id` integer REFERENCES utilisateurs(id);--> statement-breakpoint
ALTER TABLE `temps` ADD `proprietaire_id` integer REFERENCES utilisateurs(id);--> statement-breakpoint
-- Rattachement des données existantes au premier compte créé.
-- Sans cela, tout ce qui date d'avant les comptes se retrouverait sans
-- propriétaire, donc invisible pour tout le monde.
-- Sur une installation neuve, il n'y a ni compte ni données : ces mises à
-- jour ne touchent alors aucune ligne.
UPDATE `etudes` SET `proprietaire_id` = (SELECT MIN(`id`) FROM `utilisateurs`) WHERE `proprietaire_id` IS NULL;--> statement-breakpoint
UPDATE `pages` SET `proprietaire_id` = (SELECT MIN(`id`) FROM `utilisateurs`) WHERE `proprietaire_id` IS NULL;--> statement-breakpoint
UPDATE `taches` SET `proprietaire_id` = (SELECT MIN(`id`) FROM `utilisateurs`) WHERE `proprietaire_id` IS NULL;--> statement-breakpoint
UPDATE `documents` SET `proprietaire_id` = (SELECT MIN(`id`) FROM `utilisateurs`) WHERE `proprietaire_id` IS NULL;--> statement-breakpoint
UPDATE `faq` SET `proprietaire_id` = (SELECT MIN(`id`) FROM `utilisateurs`) WHERE `proprietaire_id` IS NULL;--> statement-breakpoint
UPDATE `temps` SET `proprietaire_id` = (SELECT MIN(`id`) FROM `utilisateurs`) WHERE `proprietaire_id` IS NULL;
