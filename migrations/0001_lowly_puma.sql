CREATE TABLE `resourceCategory` (
	`id` varchar(32) NOT NULL,
	`name` varchar(32) NOT NULL,
	`create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `resourceCategory_id` PRIMARY KEY(`id`),
	CONSTRAINT `resourceCategory_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `resources` ADD `type` varchar(32);--> statement-breakpoint
CREATE INDEX `resource_category_name_idx` ON `resourceCategory` (`name`);--> statement-breakpoint
CREATE INDEX `resource_category_id_name_idx` ON `resourceCategory` (`id`,`name`);--> statement-breakpoint
ALTER TABLE `resources` ADD CONSTRAINT `resources_type_resourceCategory_id_fk` FOREIGN KEY (`type`) REFERENCES `resourceCategory`(`id`) ON DELETE set null ON UPDATE no action;