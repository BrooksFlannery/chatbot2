import { pgTable, text, timestamp, uuid, varchar, pgEnum } from "drizzle-orm/pg-core";

// Clean schema for Clerk authentication
// No user tables needed - Clerk handles user management

export const chat = pgTable("chat", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("userId").notNull(), // Clerk user ID (string)
    chatName: varchar("chatName", { length: 256 }).default("New Chat"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export const roleEnum = pgEnum("role", ["user", "assistant", "tool", "system"]);

export const message = pgTable("message", {
    id: uuid("id").defaultRandom().primaryKey(),
    chatId: uuid("chatId").notNull().references(() => chat.id),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    accessedAt: timestamp("accessedAt", { withTimezone: true }).defaultNow().notNull(),
    role: roleEnum("role").notNull(),
});

export const schema = { chat, message }
