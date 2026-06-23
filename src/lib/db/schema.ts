import {
  mysqlTable,
  varchar,
  int,
  text,
  boolean,
  timestamp,
  datetime,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  role: mysqlEnum("role", ["admin", "editor"]).notNull().default("editor"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: datetime("expires_at").notNull(),
});

export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 120 }).notNull(),
  year: int("year"),
  location: varchar("location", { length: 200 }),
  client: varchar("client", { length: 200 }),
  direction: varchar("direction", { length: 200 }),
  summary: text("summary"),
  description: text("description"),
  coverImage: varchar("cover_image", { length: 400 }),
  published: boolean("published").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projectImages = mysqlTable("project_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 400 }).notNull(),
  kind: mysqlEnum("kind", ["image", "video"]).notNull().default("image"),
  sortOrder: int("sort_order").notNull().default(0),
});

export const logos = mysqlTable("logos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  kind: mysqlEnum("kind", ["cliente", "proveedor"]).notNull(),
  name: varchar("name", { length: 200 }),
  imageUrl: varchar("image_url", { length: 400 }).notNull(),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mediaDocuments = mysqlTable("media_documents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  docDate: varchar("doc_date", { length: 40 }),
  fileUrl: varchar("file_url", { length: 400 }),
  fileName: varchar("file_name", { length: 255 }),
  published: boolean("published").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: text("value"),
});

export type User = typeof users.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectImage = typeof projectImages.$inferSelect;
export type Logo = typeof logos.$inferSelect;
export type MediaDocument = typeof mediaDocuments.$inferSelect;
