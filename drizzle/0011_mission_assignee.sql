ALTER TABLE `taches` ADD `assigne_a` integer REFERENCES `utilisateurs`(`id`) ON DELETE set null;
--> statement-breakpoint
CREATE INDEX `idx_taches_assigne` ON `taches` (`assigne_a`);
