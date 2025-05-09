import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertWalletSchema, 
  insertTokenSchema, 
  insertTransactionSchema 
} from "@shared/schema";
import { cryptocurrencies } from "../client/src/lib/cryptocurrencies";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up express session with memory store
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "cryptopilot-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      },
    })
  );
  
  // Set up passport for authentication
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        // In a real app, you would use bcrypt to compare hashed passwords
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create new user
      const user = await storage.createUser(data);
      
      // Log in the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        
        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      
      return res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Return user data without password
    const { password, ...userWithoutPassword } = req.user as any;
    return res.json(userWithoutPassword);
  });
  
  // Cryptocurrency routes
  app.get("/api/cryptocurrencies", async (req, res) => {
    try {
      // For now, use the static data
      res.json(cryptocurrencies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cryptocurrencies" });
    }
  });
  
  app.get("/api/cryptocurrencies/top/:limit", async (req, res) => {
    try {
      const limit = parseInt(req.params.limit) || 20;
      const topCryptos = cryptocurrencies.slice(0, limit);
      res.json(topCryptos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top cryptocurrencies" });
    }
  });
  
  app.get("/api/cryptocurrencies/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const crypto = cryptocurrencies.find(c => c.symbol === symbol);
      
      if (!crypto) {
        return res.status(404).json({ message: "Cryptocurrency not found" });
      }
      
      res.json(crypto);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cryptocurrency" });
    }
  });
  
  // Protected routes (require authentication)
  // Wallet routes
  app.get("/api/wallets", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const wallets = await storage.getWalletsByUserId(user.id);
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });
  
  app.post("/api/wallets", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertWalletSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const wallet = await storage.createWallet(data);
      res.status(201).json(wallet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create wallet" });
    }
  });
  
  // Token routes
  app.get("/api/tokens", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const tokens = await storage.getTokensByUserId(user.id);
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tokens" });
    }
  });
  
  app.post("/api/tokens/generate", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertTokenSchema.parse({
        ...req.body,
        userId: user.id,
        type: "generate"
      });
      
      const token = await storage.createToken(data);
      
      // Create a transaction record for this generation
      const transaction = await storage.createTransaction({
        userId: user.id,
        type: "generate",
        fromSymbol: null,
        toSymbol: data.symbol,
        amount: data.amount,
        recipientAddress: null,
        blockchain: data.blockchain,
        status: "completed"
      });
      
      res.status(201).json({ token, transaction });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to generate token" });
    }
  });
  
  // Transaction routes
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const transactions = await storage.getTransactionsByUserId(user.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  
  app.post("/api/transactions/convert", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertTransactionSchema.parse({
        ...req.body,
        userId: user.id,
        type: "convert",
        status: "completed"
      });
      
      const transaction = await storage.createTransaction(data);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to convert token" });
    }
  });
  
  app.post("/api/transactions/transfer", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertTransactionSchema.parse({
        ...req.body,
        userId: user.id,
        type: "transfer",
        status: "completed"
      });
      
      const transaction = await storage.createTransaction(data);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to transfer token" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
