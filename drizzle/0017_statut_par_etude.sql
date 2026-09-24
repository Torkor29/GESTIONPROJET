ALTER TABLE `taches_etudes` ADD `statut` text DEFAULT 'a_faire' NOT NULL;--> statement-breakpoint
ALTER TABLE `taches_etudes` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `taches_etudes` ADD `terminee_le` integer;--> statement-breakpoint
-- Reprise de ce qui a pu être saisi avec la table `tache_etudes` (migration
-- 0016) : chaque étude d'une mission garde son statut et son commentaire.
INSERT OR IGNORE INTO `taches_etudes` (`tache_id`, `etude_id`, `statut`, `notes`, `terminee_le`)
  SELECT `tache_id`, `etude_id`, `statut`, `notes`, `terminee_le` FROM `tache_etudes`;
--> statement-breakpoint
-- `taches.etude_id` reprend la première étude de la mission, comme ailleurs.
UPDATE `taches` SET `etude_id` = (
  SELECT min(`etude_id`) FROM `taches_etudes` WHERE `taches_etudes`.`tache_id` = `taches`.`id`
) WHERE `etude_id` IS NULL
  AND EXISTS (SELECT 1 FROM `taches_etudes` WHERE `taches_etudes`.`tache_id` = `taches`.`id`);
--> statement-breakpoint
-- Une mission créée avec une seule étude, sans ligne de jointure, en reçoit une.
INSERT OR IGNORE INTO `taches_etudes` (`tache_id`, `etude_id`)
  SELECT `id`, `etude_id` FROM `taches` WHERE `etude_id` IS NOT NULL;
--> statement-breakpoint
DROP TABLE `tache_etudes`;
