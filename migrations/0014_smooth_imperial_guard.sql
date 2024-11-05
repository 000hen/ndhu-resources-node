CREATE TABLE `userFavorites` (
	`id` varchar(36) NOT NULL,
	`user` varchar(36) NOT NULL,
	`resource` int NOT NULL,
	`create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `userFavorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `userFavorites` ADD CONSTRAINT `userFavorites_user_premissions_user_id_fk` FOREIGN KEY (`user`) REFERENCES `premissions`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userFavorites` ADD CONSTRAINT `userFavorites_resource_resources_id_fk` FOREIGN KEY (`resource`) REFERENCES `resources`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_favorites_user_idx` ON `userFavorites` (`user`);--> statement-breakpoint
CREATE INDEX `user_favorites_resource_idx` ON `userFavorites` (`resource`);--> statement-breakpoint
CREATE INDEX `user_favorites_user_resource_idx` ON `userFavorites` (`user`,`resource`);--> statement-breakpoint
CREATE INDEX `user_favorites_create_at_idx` ON `userFavorites` (`create_at`);