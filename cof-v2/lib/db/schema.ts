import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  decimal,
  boolean,
  integer,
  json,
} from "drizzle-orm/pg-core";

export const fundingLists = pgTable("funding_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  monthlyBudget: decimal("monthly_budget").notNull(),
  userId: text("user_id").notNull(), // Cardano wallet address
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  repository: text("repository").notNull(),
  platform: text("platform").notNull(), // github, gitlab, etc.
  stars: text("stars"),
  dependencies: json("dependencies").$type<string[]>(),
  monthlyFunding: decimal("monthly_funding").notNull(),
  status: text("status").notNull(), // active, pending, etc.
  cardanoAddress: text("cardano_address"), // For receiving funds
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fundingListProjects = pgTable("funding_list_projects", {
  id: serial("id").primaryKey(),
  fundingListId: integer("funding_list_id")
    .notNull()
    .references(() => fundingLists.id, { onDelete: "cascade" }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  distributionPercentage: decimal("distribution_percentage").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: decimal("amount").notNull(),
  fundingListId: integer("funding_list_id")
    .notNull()
    .references(() => fundingLists.id),
  status: text("status").notNull(), // completed, pending, failed
  txHash: text("tx_hash"), // Cardano transaction hash
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const fundingListsRelations = relations(fundingLists, ({ many }) => ({
  projects: many(fundingListProjects),
  transactions: many(transactions),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  fundingLists: many(fundingListProjects),
}));

export const fundingListProjectsRelations = relations(fundingListProjects, ({ one }) => ({
  fundingList: one(fundingLists, {
    fields: [fundingListProjects.fundingListId],
    references: [fundingLists.id],
  }),
  project: one(projects, {
    fields: [fundingListProjects.projectId],
    references: [projects.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  fundingList: one(fundingLists, {
    fields: [transactions.fundingListId],
    references: [fundingLists.id],
  }),
})); 