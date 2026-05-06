import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  numeric,
} from "drizzle-orm/pg-core";

// ─── Schema ────────────────────────────────────────────────────────────────

export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(), // Supabase auth user UUID
  email: text("email").notNull(),
  freeGenerationsUsed: integer("free_generations_used").notNull().default(0),
  purchasedCredits: integer("purchased_credits").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sitesTable = pgTable("sites", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  style: text("style"),
  generatedHtml: text("generated_html").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  paymentId: text("payment_id").notNull().unique(),
  amountUsd: numeric("amount_usd", { precision: 10, scale: 2 }),
  creditsPurchased: integer("credits_purchased").notNull(),
  status: text("status").notNull().default("pending"), // pending | completed | failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Client ────────────────────────────────────────────────────────────────

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const queryClient = postgres(process.env.DATABASE_URL, { max: 1 });

export const db = drizzle(queryClient, {
  schema: { profilesTable, sitesTable, paymentsTable },
});
