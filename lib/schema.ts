import {
  pgTable,
  text,
  jsonb,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
export const contentTable = pgTable("content", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const inquiryTable = pgTable("inquiry", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  service: text("service").notNull(),
  message: text("message").notNull(),
  addressed: boolean("addressed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const rateTable = pgTable("rate_limit", {
  key: text("key").primaryKey(),
  count: integer("count").default(1).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});
