ALTER TABLE `resources` DROP INDEX `resources_hash_unique`;--> statement-breakpoint
DROP INDEX `resources_hash_idx` ON `resources`;--> statement-breakpoint
ALTER TABLE `resources` DROP COLUMN `hash`;