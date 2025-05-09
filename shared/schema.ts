import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name"),
  phoneNumber: text("phone_number"),
  profilePicture: text("profile_picture"),
  role: text("role").default("user").notNull(), // "user", "admin"
  isActive: boolean("is_active").default(true).notNull(),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  suspensionReason: text("suspension_reason"),
  suspensionEndDate: timestamp("suspension_end_date"),
  lastLoginAt: timestamp("last_login_at"),
  lastLogoutAt: timestamp("last_logout_at"),
  preferences: json("preferences").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  phoneNumber: true,
  profilePicture: true,
  role: true,
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

// Authentication logs
export const authLogs = pgTable("auth_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // 'login', 'logout', 'register', 'password_reset'
  status: text("status").notNull(), // 'success', 'failure'
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  details: json("details").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuthLogSchema = createInsertSchema(authLogs).pick({
  userId: true,
  action: true,
  status: true,
  ipAddress: true,
  userAgent: true,
  details: true,
});

// API keys for external integrations
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  type: text("type").notNull(), // 'coinmarketcap', 'blockchain_ethereum', etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  name: true,
  key: true,
  type: true,
  isActive: true,
  expiresAt: true,
});

// System configuration
export const systemConfig = pgTable("system_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: json("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemConfigSchema = createInsertSchema(systemConfig).pick({
  key: true,
  value: true,
  description: true,
});

// Export additional types
export type AuthLog = typeof authLogs.$inferSelect;
export type InsertAuthLog = z.infer<typeof insertAuthLogSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;
