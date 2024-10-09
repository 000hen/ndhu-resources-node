CREATE TABLE `resourcesReviewer` (
	`id` varchar(36) NOT NULL,
	`reviewer` varchar(36),
	`resource` int NOT NULL,
	`reason` text,
	`state` enum('uploading','pending','approved','rejected','DMCA takedown') NOT NULL DEFAULT 'pending',
	`create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `resourcesReviewer_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `resourcesReviewer` ADD CONSTRAINT `resourcesReviewer_reviewer_premissions_user_id_fk` FOREIGN KEY (`reviewer`) REFERENCES `premissions`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resourcesReviewer` ADD CONSTRAINT `resourcesReviewer_resource_resources_id_fk` FOREIGN KEY (`resource`) REFERENCES `resources`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `resource_reviewer_reviewer_idx` ON `resourcesReviewer` (`reviewer`);--> statement-breakpoint
CREATE INDEX `resource_reviewer_resource_idx` ON `resourcesReviewer` (`resource`);--> statement-breakpoint
CREATE INDEX `resource_reviewer_reviewer_resource_idx` ON `resourcesReviewer` (`reviewer`,`resource`);--> statement-breakpoint
CREATE INDEX `resource_reviewer_create_at_idx` ON `resourcesReviewer` (`create_at`);