CREATE TABLE `resourceReport` (
	`id` varchar(36) NOT NULL,
	`reporter` varchar(36) NOT NULL,
	`resource` int NOT NULL,
	`category` enum('inappropriate','nsfw','suicide','bullying','hatred','copyright','sexal','incorrect'),
	`reason` text NOT NULL,
	`create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `resourceReport_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `resourceReport` ADD CONSTRAINT `resourceReport_reporter_premissions_user_id_fk` FOREIGN KEY (`reporter`) REFERENCES `premissions`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resourceReport` ADD CONSTRAINT `resourceReport_resource_resources_id_fk` FOREIGN KEY (`resource`) REFERENCES `resources`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `resource_report_reporter_idx` ON `resourceReport` (`reporter`);--> statement-breakpoint
CREATE INDEX `resource_report_resource_idx` ON `resourceReport` (`resource`);--> statement-breakpoint
CREATE INDEX `resource_report_reporter_resource_idx` ON `resourceReport` (`reporter`,`resource`);--> statement-breakpoint
CREATE INDEX `resource_report_create_at_idx` ON `resourceReport` (`create_at`);