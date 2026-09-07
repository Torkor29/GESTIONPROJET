CREATE TABLE `sous_taches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tache_id` integer NOT NULL,
	`titre` text NOT NULL,
	`faite` integer DEFAULT false NOT NULL,
	`ordre` integer DEFAULT 0 NOT NULL,
	`cree_le` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`tache_id`) REFERENCES `taches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_sous_taches_tache` ON `sous_taches` (`tache_id`);
