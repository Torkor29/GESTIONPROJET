ALTER TABLE `taches` ADD `rappel_le` integer;--> statement-breakpoint
ALTER TABLE `taches` ADD `rappel_envoye_le` integer;--> statement-breakpoint
ALTER TABLE `taches` ADD `rappel_echeance_envoye_le` integer;--> statement-breakpoint
ALTER TABLE `utilisateurs` ADD `rappel_jours` integer DEFAULT 3 NOT NULL;