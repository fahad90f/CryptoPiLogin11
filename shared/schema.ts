import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Wallet schema
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  address: text("address").notNull(),
  blockchain: text("blockchain").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  address: true,
  blockchain: true,
});

// Token schema
export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  amount: text("amount").notNull(),
  blockchain: text("blockchain").notNull(),
  securityLevel: text("security_level").notNull(),
  isAiEnhanced: boolean("is_ai_enhanced").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTokenSchema = createInsertSchema(tokens).pick({
  userId: true,
  symbol: true,
  amount: true,
  blockchain: true,
  securityLevel: true,
  isAiEnhanced: true,
});

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'generate', 'convert', 'transfer'
  fromSymbol: text("from_symbol"),
  toSymbol: text("to_symbol"),
  amount: text("amount").notNull(),
  recipientAddress: text("recipient_address"),
  blockchain: text("blockchain").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  fromSymbol: true,
  toSymbol: true,
  amount: true,
  recipientAddress: true,
  blockchain: true,
  status: true,
});

// Cryptocurrency schema
export const cryptocurrencies = pgTable("cryptocurrencies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull().unique(),
  price: text("price").notNull(),
  change24h: text("change_24h").notNull(),
  change7d: text("change_7d").notNull(),
  marketCap: text("market_cap").notNull(),
  rank: integer("rank").notNull(),
  isDefault: boolean("is_default").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCryptocurrencySchema = createInsertSchema(cryptocurrencies).pick({
  name: true,
  symbol: true,
  price: true,
  change24h: true,
  change7d: true,
  marketCap: true,
  rank: true,
  isDefault: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Token = typeof tokens.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;
export type InsertCryptocurrency = z.infer<typeof insertCryptocurrencySchema>;
