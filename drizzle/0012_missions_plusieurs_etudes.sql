CREATE TABLE `taches_etudes` (
	`tache_id` integer NOT NULL,
	`etude_id` integer NOT NULL,
	PRIMARY KEY(`tache_id`, `etude_id`),
	FOREIGN KEY (`tache_id`) REFERENCES `taches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`etude_id`) REFERENCES `etudes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_taches_etudes_etude` ON `taches_etudes` (`etude_id`);
--> statement-breakpoint
INSERT INTO `taches_etudes` (`tache_id`, `etude_id`)
SELECT `id`, `etude_id` FROM `taches` WHERE `etude_id` IS NOT NULL;
