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
      
      // Create new user with default role if not specified
      const userData = {
        ...data,
        role: data.role || "user"  // Ensure role is specified
      };
      
      try {
        // Create new user
        const user = await storage.createUser(userData);
        
        // Log in the user
        req.login(user, (err) => {
          if (err) {
            console.error("Login error after registration:", err);
            return res.status(500).json({ message: "Login failed after registration" });
          }
          
          // Return user data without password
          const { password, ...userWithoutPassword } = user;
          return res.status(201).json(userWithoutPassword);
        });
      } catch (dbError) {
        console.error("Database error during user creation:", dbError);
        return res.status(500).json({ message: "Failed to register user - database error" });
      }
    } catch (error) {
      console.error("Registration error:", error);
      
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
  
  // Profile routes
  app.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      
      // Get user data
      const userData = await storage.getUser(userId);
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get wallets, tokens, and transactions
      const wallets = await storage.getWalletsByUserId(userId);
      const tokens = await storage.getTokensByUserId(userId);
      const transactions = await storage.getTransactionsByUserId(userId);
      
      // Return profile data without password
      const { password: _, ...userProfile } = userData;
      
      res.json({
        user: userProfile,
        wallets,
        tokens,
        recentTransactions: transactions.slice(0, 5)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  
  app.patch("/api/profile", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      const { displayName, email, phoneNumber } = req.body;
      
      // Update user
      const updatedUser = await storage.updateUser(userId, {
        displayName,
        email,
        phoneNumber,
        updatedAt: new Date()
      });
      
      // Return updated user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  app.put("/api/profile/password", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Verify current password
      const userData = await storage.getUser(userId);
      if (!userData || userData.password !== currentPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Update password
      await storage.updateUser(userId, {
        password: newPassword,
        updatedAt: new Date()
      });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  
  app.get("/api/profile/performance", requireAuth, async (req, res) => {
    try {
      // Mock performance data for now
      const data = [
        { date: "Jan", value: 1000 },
        { date: "Feb", value: 1200 },
        { date: "Mar", value: 900 },
        { date: "Apr", value: 1500 },
        { date: "May", value: 2000 },
        { date: "Jun", value: 1800 },
        { date: "Jul", value: 2200 },
      ];
      
      res.json({
        data,
        currentValue: 2200,
        growthPercentage: "+120%",
        monthlyChange: "+22%"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });
  
  // Admin routes
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user as any;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  };
  
  // Admin API Routes
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || undefined;
      
      try {
        // Get all users from database
        const { users, total } = await storage.getAllUsers(page, limit, search);
        
        // Map to remove passwords
        const safeUsers = users.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
        
        res.json({
          users: safeUsers,
          total
        });
      } catch (dbError) {
        console.error("Database error fetching users:", dbError);
        res.status(500).json({ message: "Database error fetching users" });
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.get("/api/admin/statistics", requireAdmin, async (req, res) => {
    try {
      // Mock statistics for now
      res.json({
        totalUsers: 243,
        activeUsers: 156,
        newUsersToday: 8,
        totalTransactions: 1254,
        transactionsToday: 72,
        totalVolume: "42,500",
        volumeToday: "3,800",
        activeWallets: 189,
        conversionRate: 76.5,
        userGrowth: [
          { date: "Mon", count: 4 },
          { date: "Tue", count: 7 },
          { date: "Wed", count: 5 },
          { date: "Thu", count: 8 },
          { date: "Fri", count: 12 },
          { date: "Sat", count: 9 },
          { date: "Sun", count: 11 }
        ],
        transactionsByType: [
          { type: 'generate', count: 42 },
          { type: 'convert', count: 28 },
          { type: 'transfer', count: 15 }
        ],
        revenueData: [
          { date: 'Mon', amount: 1200 },
          { date: 'Tue', amount: 1800 },
          { date: 'Wed', amount: 1400 },
          { date: 'Thu', amount: 2200 },
          { date: 'Fri', amount: 1900 },
          { date: 'Sat', amount: 1600 },
          { date: 'Sun', amount: 2100 }
        ]
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  
  app.get("/api/integrations/coinmarketcap/listings", requireAuth, async (req, res) => {
    try {
      // Mock data until API integration is implemented
      const data = Array(20).fill(0).map((_, i) => ({
        id: i + 1,
        name: `Crypto ${i + 1}`,
        symbol: `CR${i + 1}`,
        quote: {
          USD: {
            price: Math.random() * 10000,
            percent_change_1h: (Math.random() - 0.5) * 10,
            percent_change_24h: (Math.random() - 0.5) * 20,
            percent_change_7d: (Math.random() - 0.5) * 30,
            market_cap: Math.random() * 1000000000,
            volume_24h: Math.random() * 500000000,
            circulating_supply: Math.random() * 100000000
          }
        }
      }));
      
      res.json({
        status: { 
          timestamp: new Date().toISOString(),
          error_code: 0,
          error_message: null,
          credit_count: 1
        },
        data
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cryptocurrency listings" });
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
