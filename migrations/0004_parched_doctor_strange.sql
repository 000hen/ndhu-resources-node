ALTER TABLE `resources` MODIFY COLUMN `filename` varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `storage_filename` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD CONSTRAINT `resources_storage_filename_unique` UNIQUE(`storage_filename`);