import { 
  users, type User, type InsertUser,
  wallets, type Wallet, type InsertWallet,
  tokens, type Token, type InsertToken,
  transactions, type Transaction, type InsertTransaction,
  cryptocurrencies, type Cryptocurrency, type InsertCryptocurrency
} from "@shared/schema";
import { cryptocurrencies as cryptoData } from "../client/src/lib/cryptocurrencies";

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
      createdAt: timestamp
    };
    this.users.set(id, user);
    return user;
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

export const storage = new MemStorage();
