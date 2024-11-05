import { relations, sql } from "drizzle-orm";
import { mysqlTable, text, foreignKey, index, int, varchar, timestamp, mysqlEnum, customType } from "drizzle-orm/mysql-core";
import { v4 } from "uuid";

export const courses = mysqlTable("courses", {
    id: int("id")
        .autoincrement()
        .primaryKey(),
    display_id: varchar('display_id', { length: 24 })
        .unique()
        .notNull(),
    name: varchar("name", { length: 64 })
        .notNull(),
    teacher: varchar("teacher", { length: 64 })
}, courses => ({
    name_idx: index("courses_name_idx").on(courses.name),
    teacher_idx: index("courses_teacher_idx").on(courses.teacher),
    name_teacher_idx: index("courses_name_teacher_idx").on(courses.name, courses.teacher)
}));

export const courseRelations = relations(courses, ({ many }) => ({
    resources: many(resources)
}));

/**
 * For the premission type:
 * 
 * 0 0 0 0 1 => 1 << 0 => disabled user
 * 0 0 0 1 0 => 1 << 1 => user (without email verification)
 * 0 0 1 0 0 => 1 << 2 => checked user (with email verification, which can submit files and post comments)
 * 0 1 0 0 0 => 1 << 3 => authorized user (manual change. users in this role can review, create, modify, and delete files)
 * 1 0 0 0 0 => 1 << 4 => admin (manual change. users in this role can modify any data in the database.)
 */

export const premissions = mysqlTable("premissions", {
    user_id: varchar("user_id", { length: 36 })
        .primaryKey()
        .notNull(),
    display: varchar("display", { length: 32 })
        .notNull()
        .default(""),
    premission: int("premission")
        .notNull()
        .default(2)
}, premissions => ({
    premission_idx: index("premissions_premission_idx").on(premissions.premission)
}));

export const premissionRelations = relations(premissions, ({ many }) => ({
    resources: many(resources),
    pushOrDump: many(pushOrDump),
    comments: many(comments),
    downloaded: many(resourceDownloaded),
    reports: many(resourceReport),
    reviews: many(resourceReviewer),
    favorites: many(userFavorites)
}));

export const userFavorites = mysqlTable("userFavorites", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .$defaultFn(() => v4())
        .notNull(),
    user: varchar("user", { length: 36 })
        .notNull()
        .references(() => premissions.user_id, { onDelete: "cascade" }),
    resource: int("resource")
        .notNull()
        .references(() => resources.id, { onDelete: "cascade" }),
    create_at: timestamp("create_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
}, userFavorites => ({
    user_idx: index("user_favorites_user_idx").on(userFavorites.user),
    resource_idx: index("user_favorites_resource_idx").on(userFavorites.resource),
    user_resource_idx: index("user_favorites_user_resource_idx").on(userFavorites.user, userFavorites.resource),
    create_at_idx: index("user_favorites_create_at_idx").on(userFavorites.create_at)
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
    user: one(premissions, { fields: [userFavorites.user], references: [premissions.user_id] }),
    resource: one(resources, { fields: [userFavorites.resource], references: [resources.id] })
}));

export const tagTypes = customType<{ data: string[], driverData: string }>({
    dataType: () => "text",
    toDriver: (value: string[]) => value.join(", "),
    fromDriver: (value: string) => value.split(", ")
});
const stateEnums = ["uploading", "pending", "approved", "rejected", "DMCA takedown"] as const;

export const resources = mysqlTable("resources", {
    id: int("id")
        .autoincrement()
        .primaryKey(),
    name: varchar("name", { length: 256 })
        .notNull(),
    courses: int("courses")
        .references(() => courses.id, { onDelete: "set null" }),
    filename: varchar("filename", { length: 256 })
        .notNull()
        .unique(),
    storageFilename: varchar("storage_filename", { length: 36 })
        .notNull()
        .unique()
        .$defaultFn(() => v4()),
    description: text("description"),
    tags: tagTypes("tags"),
    upload_by: varchar("upload_by", { length: 36 })
        .notNull()
        .references(() => premissions.user_id, { onDelete: "set default" })
        .default(""),
    type: varchar("type", { length: 32 })
        .references(() => resourceCategory.id, { onDelete: "set null" }),
    create_at: timestamp("create_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    state: mysqlEnum("state", stateEnums)
        .notNull()
        .default("uploading"),
}, resources => ({
    name_idx: index("resources_name_idx").on(resources.name),
    course_idx: index("resources_course_idx").on(resources.courses),
    uploader_idx: index("resources_uploader_idx").on(resources.upload_by),
    create_at_idx: index("resources_create_at_idx").on(resources.create_at),
}));

export const resourceRelations = relations(resources, ({ one, many }) => ({
    course: one(courses, { fields: [resources.courses], references: [courses.id] }),
    author: one(premissions, { fields: [resources.upload_by], references: [premissions.user_id] }),
    category: one(resourceCategory, { fields: [resources.type], references: [resourceCategory.id] }),
    pushOrDump: many(pushOrDump),
    comments: many(resources),
    downloaded: many(resourceDownloaded),
    reports: many(resourceReport),
    reviews: many(resourceReviewer)
}));

export const pushOrDump = mysqlTable("pushOrDump", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .$defaultFn(() => v4())
        .notNull(),
    author: varchar("author", { length: 36 })
        .notNull()
        .references(() => premissions.user_id, { onDelete: "cascade" }),
    resource: int("resource")
        .notNull()
        .references(() => resources.id, { onDelete: "cascade" }),
    isPush: int("is_push")
        .notNull()
        .default(1),
    create_at: timestamp("create_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
}, pushOrDump => ({
    author_idx: index("push_or_dump_author_idx").on(pushOrDump.author),
    resource_idx: index("push_or_dump_resource_idx").on(pushOrDump.resource),
    author_resource_idx: index("push_or_dump_author_resource_idx").on(pushOrDump.author, pushOrDump.resource),
    resource_ispush_idx: index("push_or_dump_resource_ispush_idx").on(pushOrDump.resource, pushOrDump.isPush),
    create_at_idx: index("push_or_dump_create_at_idx").on(pushOrDump.create_at)
}));

export const pushOrDumpRelations = relations(pushOrDump, ({ one }) => ({
    author: one(premissions, { fields: [pushOrDump.author], references: [premissions.user_id] }),
    resource: one(resources, { fields: [pushOrDump.resource], references: [resources.id] })
}));

export const comments = mysqlTable("comments", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .notNull()
        .$defaultFn(() => v4()),
    parent: varchar("parent", { length: 36 }),
    author: varchar("author", { length: 36 })
        .notNull()
        .references(() => premissions.user_id, { onDelete: "cascade" }),
    resource: int("resource")
        .notNull()
        .references(() => resources.id, { onDelete: "cascade" }),
    content: text("content")
        .notNull(),
    create_at: timestamp("create_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
}, comments => ({
    author_idx: index("comments_author_idx").on(comments.author),
    resource_idx: index("comments_resource_idx").on(comments.resource),
    author_resource: index("comments_author_resource_idx").on(comments.author, comments.resource),
    create_at_idx: index("comments_create_at_idx").on(comments.create_at),
    parent_reference: foreignKey({
        name: "comments_parent_fk",
        columns: [comments.parent],
        foreignColumns: [comments.id],
    })
}));

export const commentsRelations = relations(comments, ({ one }) => ({
    author: one(premissions, { fields: [comments.author], references: [premissions.user_id] }),
    resource: one(resources, { fields: [comments.resource], references: [resources.id] })
}));

export const resourceDownloaded = mysqlTable("resourceDownloaded", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .$defaultFn(() => v4())
        .notNull(),
    author: varchar("author", { length: 36 })
        .notNull()
        .references(() => premissions.user_id, { onDelete: "cascade" }),
    resource: int("resource")
        .notNull()
        .references(() => resources.id, { onDelete: "cascade" }),
    create_at: timestamp("create_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
}, resourceDownloaded => ({
    author_idx: index("resource_downloaded_author_idx").on(resourceDownloaded.author),
    resource_idx: index("resource_downloaded_resource_idx").on(resourceDownloaded.resource),
    author_resource_idx: index("resource_downloaded_author_resource_idx").on(resourceDownloaded.author, resourceDownloaded.resource),
    create_at_idx: index("resource_downloaded_create_at_idx").on(resourceDownloaded.create_at)
}));

export const resourceDownloadedRelations = relations(resourceDownloaded, ({ one }) => ({
    author: one(premissions, { fields: [resourceDownloaded.author], references: [premissions.user_id] }),
    resource: one(resources, { fields: [resourceDownloaded.resource], references: [resources.id] })
}));

export const resourceCategory = mysqlTable("resourceCategory", {
    id: varchar("id", { length: 32 })
        .primaryKey()
        .notNull(),
    name: varchar("name", { length: 32 })
        .notNull()
        .unique(),
    create_at: timestamp("create_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
}, resourceCategory => ({
    name_idx: index("resource_category_name_idx").on(resourceCategory.name),
    id_name_idx: index("resource_category_id_name_idx").on(resourceCategory.id, resourceCategory.name)
}));

export const resourceCategoryRelations = relations(resourceCategory, ({ many }) => ({
    resources: many(resources)
}));

export const resourceReport = mysqlTable("resourceReport", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .$defaultFn(() => v4())
        .notNull(),
    reporter: varchar("reporter", { length: 36 })
        .notNull()
        .references(() => premissions.user_id, { onDelete: "cascade" }),
    resource: int("resource")
        .notNull()
        .references(() => resources.id, { onDelete: "cascade" }),
    category: mysqlEnum("category", ["inappropriate", "nsfw", "suicide", "bullying", "harmful", "hatred", "copyright", "incorrect"]),
    reason: text("reason"),
    create_at: timestamp("create_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
}, resourceReport => ({
    reporter_idx: index("resource_report_reporter_idx").on(resourceReport.reporter),
    resource_idx: index("resource_report_resource_idx").on(resourceReport.resource),
    reporter_resource_idx: index("resource_report_reporter_resource_idx").on(resourceReport.reporter, resourceReport.resource),
    create_at_idx: index("resource_report_create_at_idx").on(resourceReport.create_at)
}));

export const resourceReportRelations = relations(resourceReport, ({ one }) => ({
    reporter: one(premissions, { fields: [resourceReport.reporter], references: [premissions.user_id] }),
    resource: one(resources, { fields: [resourceReport.resource], references: [resources.id] })
}));

export const resourceReviewer = mysqlTable("resourcesReviewer", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .$defaultFn(() => v4())
        .notNull(),
    reviewer: varchar("reviewer", { length: 36 })
        .references(() => premissions.user_id, { onDelete: "cascade" }),
    resource: int("resource")
        .notNull()
        .references(() => resources.id, { onDelete: "cascade" }),
    reason: text("reason"),
    state: mysqlEnum("state", stateEnums)
        .notNull()
        .default("pending"),
    create_at: timestamp("create_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
}, resourceReviewer => ({
    reviewer_idx: index("resource_reviewer_reviewer_idx").on(resourceReviewer.reviewer),
    resource_idx: index("resource_reviewer_resource_idx").on(resourceReviewer.resource),
    reviewer_resource_idx: index("resource_reviewer_reviewer_resource_idx").on(resourceReviewer.reviewer, resourceReviewer.resource),
    create_at_idx: index("resource_reviewer_create_at_idx").on(resourceReviewer.create_at)
}));

export const resourceReviewerRelations = relations(resourceReviewer, ({ one }) => ({
    reviewer: one(premissions, { fields: [resourceReviewer.reviewer], references: [premissions.user_id] }),
    resource: one(resources, { fields: [resourceReviewer.resource], references: [resources.id] })
}));