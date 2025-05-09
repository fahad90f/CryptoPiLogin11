import { 
  users, type User, type InsertUser,
  wallets, type Wallet, type InsertWallet,
  tokens, type Token, type InsertToken,
  transactions, type Transaction, type InsertTransaction,
  cryptocurrencies, type Cryptocurrency, type InsertCryptocurrency,
  authLogs, type AuthLog, type InsertAuthLog,
  apiKeys, type ApiKey, type InsertApiKey,
  systemConfig, type SystemConfig, type InsertSystemConfig
} from "@shared/schema";
import { cryptocurrencies as cryptoData } from "../client/src/lib/cryptocurrencies";
import { db } from "./db";
import { eq, desc, gte, lte, count, like, and, or } from "drizzle-orm";

// Extend the storage interface with required methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wallet methods
  getWalletsByUserId(userId: number): Promise<Wallet[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  
  // Token methods
  getTokensByUserId(userId: number): Promise<Token[]>;
  createToken(token: InsertToken): Promise<Token>;
  
  // Transaction methods
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Cryptocurrency methods
  getAllCryptocurrencies(): Promise<Cryptocurrency[]>;
  getCryptocurrencyBySymbol(symbol: string): Promise<Cryptocurrency | undefined>;
  getTopCryptocurrencies(limit: number): Promise<Cryptocurrency[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private tokens: Map<number, Token>;
  private transactions: Map<number, Transaction>;
  private cryptocurrencies: Map<number, Cryptocurrency>;
  
  private nextUserId: number = 1;
  private nextWalletId: number = 1;
  private nextTokenId: number = 1;
  private nextTransactionId: number = 1;

  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.tokens = new Map();
    this.transactions = new Map();
    this.cryptocurrencies = new Map();
    
    // Initialize with sample cryptocurrencies
    this.initializeCryptocurrencies();
  }
  
  // Initialize cryptocurrencies with data
  private initializeCryptocurrencies() {
    cryptoData.forEach((crypto, index) => {
      const timestamp = new Date().toISOString();
      this.cryptocurrencies.set(crypto.id, {
        id: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        price: crypto.price.toString(),
        change24h: crypto.change24h.toString(),
        change7d: crypto.change7d.toString(),
        marketCap: crypto.marketCap.toString(),
        rank: crypto.rank,
        isDefault: crypto.isDefault || false,
        updatedAt: timestamp
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const timestamp = new Date().toISOString();
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      displayName: insertUser.displayName || null,
      phoneNumber: null,
      profilePicture: null,
      role: insertUser.role || "user",
      isActive: true,
      isSuspended: false,
      suspensionReason: null,
      suspensionEndDate: null,
      lastLoginAt: null,
      lastLogoutAt: null,
      preferences: {},
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.users.set(id, user);
    return user;
  }
  
  // Update user methods
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserLastLogin(id: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { 
      ...user, 
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserLastLogout(id: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { 
      ...user, 
      lastLogoutAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Wallet methods
  async getWalletsByUserId(userId: number): Promise<Wallet[]> {
    return Array.from(this.wallets.values()).filter(
      (wallet) => wallet.userId === userId
    );
  }
  
  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.nextWalletId++;
    const timestamp = new Date().toISOString();
    const wallet: Wallet = { 
      ...insertWallet, 
      id,
      createdAt: timestamp
    };
    this.wallets.set(id, wallet);
    return wallet;
  }
  
  // Token methods
  async getTokensByUserId(userId: number): Promise<Token[]> {
    return Array.from(this.tokens.values()).filter(
      (token) => token.userId === userId
    );
  }
  
  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = this.nextTokenId++;
    const timestamp = new Date().toISOString();
    const token: Token = { 
      ...insertToken, 
      id,
      createdAt: timestamp
    };
    this.tokens.set(id, token);
    return token;
  }
  
  // Transaction methods
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    ).sort((a, b) => {
      // Sort by timestamp descending (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.nextTransactionId++;
    const timestamp = new Date().toISOString();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      createdAt: timestamp
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  // Cryptocurrency methods
  async getAllCryptocurrencies(): Promise<Cryptocurrency[]> {
    return Array.from(this.cryptocurrencies.values()).sort(
      (a, b) => a.rank - b.rank
    );
  }
  
  async getCryptocurrencyBySymbol(symbol: string): Promise<Cryptocurrency | undefined> {
    return Array.from(this.cryptocurrencies.values()).find(
      (crypto) => crypto.symbol === symbol
    );
  }
  
  async getTopCryptocurrencies(limit: number): Promise<Cryptocurrency[]> {
    return Array.from(this.cryptocurrencies.values())
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Update user methods
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
  
  async updateUserLastLogin(id: number): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
  
  async updateUserLastLogout(id: number): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        lastLogoutAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }

  // Wallet methods
  async getWalletsByUserId(userId: number): Promise<Wallet[]> {
    return await db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const [wallet] = await db
      .insert(wallets)
      .values(insertWallet)
      .returning();
    return wallet;
  }

  // Token methods
  async getTokensByUserId(userId: number): Promise<Token[]> {
    return await db.select().from(tokens).where(eq(tokens.userId, userId));
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const [token] = await db
      .insert(tokens)
      .values(insertToken)
      .returning();
    return token;
  }

  // Transaction methods
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  // Cryptocurrency methods
  async getAllCryptocurrencies(): Promise<Cryptocurrency[]> {
    return await db
      .select()
      .from(cryptocurrencies)
      .orderBy(cryptocurrencies.rank);
  }

  async getCryptocurrencyBySymbol(symbol: string): Promise<Cryptocurrency | undefined> {
    const [crypto] = await db
      .select()
      .from(cryptocurrencies)
      .where(eq(cryptocurrencies.symbol, symbol));
    return crypto || undefined;
  }

  async getTopCryptocurrencies(limit: number): Promise<Cryptocurrency[]> {
    return await db
      .select()
      .from(cryptocurrencies)
      .orderBy(cryptocurrencies.rank)
      .limit(limit);
  }
}

// Additional methods for admin functionality
export class AdminStorage {
  // Get all users with pagination
  async getAllUsers(page = 1, limit = 10, search?: string): Promise<{ users: User[], total: number }> {
    const offset = (page - 1) * limit;
    
    let query = db.select().from(users);
    
    if (search) {
      query = query.where(
        or(
          like(users.username, `%${search}%`),
          like(users.email || '', `%${search}%`)
        )
      );
    }
    
    const data = await query.limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: count() }).from(users);
    
    return {
      users: data,
      total: Number(count)
    };
  }
  
  // Update user
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  // Delete user
  async deleteUser(id: number): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }
  
  // Suspend user
  async suspendUser(id: number, reason?: string, duration?: number): Promise<User | undefined> {
    const endDate = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
    
    const [user] = await db
      .update(users)
      .set({
        isSuspended: true,
        suspensionReason: reason || null,
        suspensionEndDate: endDate ? endDate.toISOString() : null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }
  
  // Unsuspend user
  async unsuspendUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        isSuspended: false,
        suspensionReason: null,
        suspensionEndDate: null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }
  
  // Reset password
  async resetPassword(id: number, newPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        password: newPassword, // This should be hashed before calling this method
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }
  
  // Get authentication logs
  async getAuthLogs(
    page = 1,
    limit = 10,
    userId?: number,
    action?: string,
    status?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ logs: AuthLog[], total: number }> {
    const offset = (page - 1) * limit;
    
    let query = db.select().from(authLogs);
    let conditions = [];
    
    if (userId) {
      conditions.push(eq(authLogs.userId, userId));
    }
    
    if (action) {
      conditions.push(eq(authLogs.action, action));
    }
    
    if (status) {
      conditions.push(eq(authLogs.status, status));
    }
    
    if (startDate) {
      conditions.push(gte(authLogs.createdAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(authLogs.createdAt, endDate));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const data = await query
      .orderBy(desc(authLogs.createdAt))
      .limit(limit)
      .offset(offset);
    
    const [{ count }] = await db.select({ count: count() }).from(authLogs);
    
    return {
      logs: data,
      total: Number(count)
    };
  }
  
  // Create auth log
  async createAuthLog(log: InsertAuthLog): Promise<AuthLog> {
    const [authLog] = await db
      .insert(authLogs)
      .values(log)
      .returning();
    
    return authLog;
  }
  
  // Get system configuration
  async getSystemConfig(): Promise<SystemConfig[]> {
    return await db.select().from(systemConfig);
  }
  
  // Update system configuration
  async updateSystemConfig(key: string, value: any, description?: string): Promise<SystemConfig> {
    // Check if config exists
    const [existingConfig] = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, key));
    
    if (existingConfig) {
      // Update existing
      const [updatedConfig] = await db
        .update(systemConfig)
        .set({
          value,
          description: description || existingConfig.description,
          updatedAt: new Date().toISOString()
        })
        .where(eq(systemConfig.key, key))
        .returning();
      
      return updatedConfig;
    } else {
      // Create new
      const [newConfig] = await db
        .insert(systemConfig)
        .values({
          key,
          value,
          description
        })
        .returning();
      
      return newConfig;
    }
  }
}

// Export database storage instances
export const storage = new DatabaseStorage();
export const adminStorage = new AdminStorage();
