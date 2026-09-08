ALTER TABLE `temps` ADD `sous_tache_id` integer REFERENCES `sous_taches`(`id`) ON DELETE set null;
--> statement-breakpoint
CREATE INDEX `idx_temps_sous_tache` ON `temps` (`sous_tache_id`);
