CREATE TABLE `comments` (
	`id` varchar(36) NOT NULL,
	`display_name` varchar(32) NOT NULL,
	`parent` varchar(36),
	`author` varchar(36) NOT NULL,
	`resource` int NOT NULL,
	`content` text NOT NULL,
	`create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`display_id` varchar(24) NOT NULL,
	`name` varchar(64) NOT NULL,
	`teacher` varchar(64),
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_display_id_unique` UNIQUE(`display_id`),
	FULLTEXT `courses_index` (`display_id`,`name`,`teacher`) WITH PARSER ngram
);
--> statement-breakpoint
CREATE TABLE `premissions` (
	`user_id` varchar(36) NOT NULL,
	`premission` int NOT NULL DEFAULT 2,
	CONSTRAINT `premissions_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `pushOrDump` (
	`id` varchar(36) NOT NULL,
	`author` varchar(36) NOT NULL,
	`resource` int NOT NULL,
	`is_push` int NOT NULL DEFAULT 1,
	`create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `pushOrDump_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resourceDownloaded` (
	`id` varchar(36) NOT NULL,
	`author` varchar(36) NOT NULL,
	`resource` int NOT NULL,
	`create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `resourceDownloaded_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`courses` int,
	`filename` varchar(36) NOT NULL,
	`description` text,
	`tags` text,
	`hash` varchar(40) NOT NULL,
	`upload_by` varchar(36) NOT NULL DEFAULT '',
	`create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`state` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	CONSTRAINT `resources_id` PRIMARY KEY(`id`),
	CONSTRAINT `resources_filename_unique` UNIQUE(`filename`),
	CONSTRAINT `resources_hash_unique` UNIQUE(`hash`),
	FULLTEXT `resource_index` (`name`,`description`,`tags`,`hash`,`upload_by`) WITH PARSER ngram
);
--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_author_premissions_user_id_fk` FOREIGN KEY (`author`) REFERENCES `premissions`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_resource_resources_id_fk` FOREIGN KEY (`resource`) REFERENCES `resources`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_parent_fk` FOREIGN KEY (`parent`) REFERENCES `comments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pushOrDump` ADD CONSTRAINT `pushOrDump_author_premissions_user_id_fk` FOREIGN KEY (`author`) REFERENCES `premissions`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pushOrDump` ADD CONSTRAINT `pushOrDump_resource_resources_id_fk` FOREIGN KEY (`resource`) REFERENCES `resources`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resourceDownloaded` ADD CONSTRAINT `resourceDownloaded_author_premissions_user_id_fk` FOREIGN KEY (`author`) REFERENCES `premissions`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resourceDownloaded` ADD CONSTRAINT `resourceDownloaded_resource_resources_id_fk` FOREIGN KEY (`resource`) REFERENCES `resources`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resources` ADD CONSTRAINT `resources_courses_courses_id_fk` FOREIGN KEY (`courses`) REFERENCES `courses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resources` ADD CONSTRAINT `resources_upload_by_premissions_user_id_fk` FOREIGN KEY (`upload_by`) REFERENCES `premissions`(`user_id`) ON DELETE set default ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `comments_display_name_idx` ON `comments` (`display_name`);--> statement-breakpoint
CREATE INDEX `comments_author_idx` ON `comments` (`author`);--> statement-breakpoint
CREATE INDEX `comments_resource_idx` ON `comments` (`resource`);--> statement-breakpoint
CREATE INDEX `comments_author_resource_idx` ON `comments` (`author`,`resource`);--> statement-breakpoint
CREATE INDEX `comments_create_at_idx` ON `comments` (`create_at`);--> statement-breakpoint
CREATE INDEX `courses_name_idx` ON `courses` (`name`);--> statement-breakpoint
CREATE INDEX `courses_teacher_idx` ON `courses` (`teacher`);--> statement-breakpoint
CREATE INDEX `courses_name_teacher_idx` ON `courses` (`name`,`teacher`);--> statement-breakpoint
CREATE INDEX `premissions_premission_idx` ON `premissions` (`premission`);--> statement-breakpoint
CREATE INDEX `push_or_dump_author_idx` ON `pushOrDump` (`author`);--> statement-breakpoint
CREATE INDEX `push_or_dump_resource_idx` ON `pushOrDump` (`resource`);--> statement-breakpoint
CREATE INDEX `push_or_dump_author_resource_idx` ON `pushOrDump` (`author`,`resource`);--> statement-breakpoint
CREATE INDEX `push_or_dump_resource_ispush_idx` ON `pushOrDump` (`resource`,`is_push`);--> statement-breakpoint
CREATE INDEX `push_or_dump_create_at_idx` ON `pushOrDump` (`create_at`);--> statement-breakpoint
CREATE INDEX `resource_downloaded_author_idx` ON `resourceDownloaded` (`author`);--> statement-breakpoint
CREATE INDEX `resource_downloaded_resource_idx` ON `resourceDownloaded` (`resource`);--> statement-breakpoint
CREATE INDEX `resource_downloaded_author_resource_idx` ON `resourceDownloaded` (`author`,`resource`);--> statement-breakpoint
CREATE INDEX `resource_downloaded_create_at_idx` ON `resourceDownloaded` (`create_at`);--> statement-breakpoint
CREATE INDEX `resources_name_idx` ON `resources` (`name`);--> statement-breakpoint
CREATE INDEX `resources_course_idx` ON `resources` (`courses`);--> statement-breakpoint
CREATE INDEX `resources_uploader_idx` ON `resources` (`upload_by`);--> statement-breakpoint
CREATE INDEX `resources_create_at_idx` ON `resources` (`create_at`);--> statement-breakpoint
CREATE INDEX `resources_hash_idx` ON `resources` (`hash`);