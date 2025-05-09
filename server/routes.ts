import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage, adminStorage } from "./storage";
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
import { verifyIdToken } from "./firebase-admin";

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
    new LocalStrategy(async (username: string, password: string, done: Function) => {
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
        const { users, total } = await adminStorage.getAllUsers(page, limit, search);
        
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
  
  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Failed to create user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  app.post("/api/admin/users/:id/reset-password", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { newPassword } = req.body;
      
      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }
      
      const user = await adminStorage.resetPassword(userId, newPassword);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Failed to reset password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  
  app.post("/api/admin/users/:id/suspend", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { reason, duration } = req.body;
      
      const user = await adminStorage.suspendUser(userId, reason, duration);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Failed to suspend user:", error);
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });
  
  app.post("/api/admin/users/:id/unsuspend", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      const user = await adminStorage.unsuspendUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Failed to unsuspend user:", error);
      res.status(500).json({ message: "Failed to unsuspend user" });
    }
  });
  
  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      const success = await adminStorage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Failed to delete user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Auth logs endpoints
  app.get("/api/admin/auth-logs", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || undefined;
      const action = req.query.action as string || undefined;
      const status = req.query.status as string || undefined;
      
      try {
        const logs = await adminStorage.getAuthLogs(page, limit, undefined, action, status);
        res.json(logs);
      } catch (dbError) {
        console.error("Database error fetching auth logs:", dbError);
        
        // Provide mock data if database queries fail
        const mockAuthLogs = [
          {
            id: 1,
            userId: 1,
            action: "login",
            status: "success",
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            user: { username: "admin" }
          },
          {
            id: 2,
            userId: 2,
            action: "login",
            status: "failure",
            ipAddress: "192.168.1.2",
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            user: { username: "user1" }
          },
          {
            id: 3,
            userId: 3,
            action: "register",
            status: "success",
            ipAddress: "192.168.1.3",
            userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
            createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            user: { username: "newuser" }
          },
          {
            id: 4,
            userId: 1,
            action: "password_reset",
            status: "success",
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            user: { username: "admin" }
          },
          {
            id: 5,
            userId: 2,
            action: "logout",
            status: "success",
            ipAddress: "192.168.1.2",
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            user: { username: "user1" }
          }
        ];
        
        // Return paginated mock data
        const offset = (page - 1) * limit;
        const paginatedLogs = mockAuthLogs.slice(offset, offset + limit);
        
        res.json({
          logs: paginatedLogs,
          total: mockAuthLogs.length
        });
      }
    } catch (error) {
      console.error("Failed to fetch auth logs:", error);
      res.status(500).json({ message: "Failed to fetch auth logs" });
    }
  });
  
  app.post("/api/admin/auth-logs", requireAdmin, async (req, res) => {
    try {
      const logData = req.body;
      const log = await adminStorage.createAuthLog(logData);
      
      res.status(201).json(log);
    } catch (error) {
      console.error("Failed to create auth log:", error);
      res.status(500).json({ message: "Failed to create auth log" });
    }
  });
  
  // API Keys endpoints
  app.get("/api/admin/api-keys", requireAdmin, async (req, res) => {
    try {
      // Mock API keys for now
      res.json([
        {
          id: 1,
          name: "Production API Key",
          key: "api_prod_xxxxxxxxxxxxxxxxxxxx",
          type: "production",
          isActive: true,
          createdAt: new Date().toISOString(),
          expiresAt: null
        },
        {
          id: 2,
          name: "Development API Key",
          key: "api_dev_xxxxxxxxxxxxxxxxxxxx",
          type: "development",
          isActive: true,
          createdAt: new Date().toISOString(),
          expiresAt: null
        },
        {
          id: 3,
          name: "Testing API Key",
          key: "api_test_xxxxxxxxxxxxxxxxxxxx",
          type: "testing",
          isActive: false,
          createdAt: new Date().toISOString(),
          expiresAt: null
        }
      ]);
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });
  
  app.post("/api/admin/api-keys", requireAdmin, async (req, res) => {
    try {
      // For mock purposes, just return a success response with a new API key
      res.status(201).json({
        id: 4,
        name: req.body.name,
        key: `api_${req.body.type}_${Math.random().toString(36).substring(2, 15)}`,
        type: req.body.type,
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt: req.body.expiresAt || null
      });
    } catch (error) {
      console.error("Failed to create API key:", error);
      res.status(500).json({ message: "Failed to create API key" });
    }
  });
  
  app.put("/api/admin/api-keys/:id/toggle", requireAdmin, async (req, res) => {
    try {
      const keyId = parseInt(req.params.id);
      // For mock purposes, just return a success response
      res.json({
        id: keyId,
        name: "API Key",
        key: `api_xxx_xxxxxxxxxxxxxxxxxxxx`,
        type: "production",
        isActive: req.body.isActive,
        createdAt: new Date().toISOString(),
        expiresAt: null
      });
    } catch (error) {
      console.error("Failed to toggle API key:", error);
      res.status(500).json({ message: "Failed to toggle API key" });
    }
  });
  
  app.delete("/api/admin/api-keys/:id", requireAdmin, async (req, res) => {
    try {
      // For mock purposes, just return a success response
      res.json({ message: "API key deleted successfully" });
    } catch (error) {
      console.error("Failed to delete API key:", error);
      res.status(500).json({ message: "Failed to delete API key" });
    }
  });
  
  // System settings endpoints
  app.get("/api/admin/system/config", requireAdmin, async (req, res) => {
    try {
      const config = await adminStorage.getSystemConfig();
      
      if (!config || config.length === 0) {
        // Return default settings if none exist
        return res.json([
          { key: "maintenance_mode", value: false, description: "Enable/disable system maintenance mode" },
          { key: "registration_enabled", value: true, description: "Allow new user registrations" },
          { key: "max_upload_size", value: 5242880, description: "Maximum file upload size in bytes" },
          { key: "allow_social_login", value: true, description: "Enable social media login options" },
          { key: "default_user_role", value: "user", description: "Default role for new registrations" },
          { key: "require_email_verification", value: true, description: "Require email verification for new accounts" },
          { key: "session_timeout", value: 3600, description: "Session timeout in seconds" },
          { key: "api_rate_limit", value: 100, description: "API rate limit per hour" }
        ]);
      }
      
      res.json(config);
    } catch (error) {
      console.error("Failed to fetch system config:", error);
      res.status(500).json({ message: "Failed to fetch system config" });
    }
  });
  
  app.put("/api/admin/system/config/:key", requireAdmin, async (req, res) => {
    try {
      const { key } = req.params;
      const { value, description } = req.body;
      
      const config = await adminStorage.updateSystemConfig(key, value, description);
      
      res.json(config);
    } catch (error) {
      console.error("Failed to update system config:", error);
      res.status(500).json({ message: "Failed to update system config" });
    }
  });
  
  app.post("/api/admin/system/config", requireAdmin, async (req, res) => {
    try {
      const { key, value, description } = req.body;
      
      if (!key) {
        return res.status(400).json({ message: "Key is required" });
      }
      
      const config = await adminStorage.updateSystemConfig(key, value, description);
      
      res.status(201).json(config);
    } catch (error) {
      console.error("Failed to create system config:", error);
      res.status(500).json({ message: "Failed to create system config" });
    }
  });
  
  app.delete("/api/admin/system/config/:key", requireAdmin, async (req, res) => {
    try {
      // Mock response
      res.json({ message: "Config deleted successfully" });
    } catch (error) {
      console.error("Failed to delete system config:", error);
      res.status(500).json({ message: "Failed to delete system config" });
    }
  });
  
  app.post("/api/admin/system/reset", requireAdmin, async (req, res) => {
    try {
      // Mock response
      res.json({ message: "System reset successfully" });
    } catch (error) {
      console.error("Failed to reset system:", error);
      res.status(500).json({ message: "Failed to reset system" });
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

  // Firebase authentication routes
  app.post("/api/auth/firebase-sync", async (req, res) => {
    try {
      const { idToken, displayName, email, photoURL } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: "ID token is required" });
      }
      
      try {
        // Verify the ID token
        const decodedToken = await verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        // Check if user exists in our database
        const existingUserByEmail = email ? await storage.getUserByUsername(email) : null;
        
        if (existingUserByEmail) {
          // User exists, update with Firebase info if needed
          const updatedUser = await storage.updateUser(existingUserByEmail.id, {
            displayName: displayName || existingUserByEmail.displayName,
            profilePicture: photoURL || existingUserByEmail.profilePicture,
            updatedAt: new Date()
          });
          
          // Login the user
          req.login(updatedUser, (err) => {
            if (err) {
              console.error("Login error after Firebase sync:", err);
              return res.status(500).json({ message: "Login failed after Firebase sync" });
            }
            
            // Return user without password
            const { password, ...userWithoutPassword } = updatedUser;
            return res.json(userWithoutPassword);
          });
        } else {
          // User doesn't exist, create a new one
          const newUser = await storage.createUser({
            username: email || `user_${uid.substring(0, 8)}`,
            password: uid, // Use Firebase UID as password (it's secure since we won't use it for login)
            email: email || null,
            displayName: displayName || "Firebase User",
            profilePicture: photoURL || null,
            role: "user"
          });
          
          // Login the user
          req.login(newUser, (err) => {
            if (err) {
              console.error("Login error after Firebase user creation:", err);
              return res.status(500).json({ message: "Login failed after Firebase user creation" });
            }
            
            // Return user without password
            const { password, ...userWithoutPassword } = newUser;
            return res.status(201).json(userWithoutPassword);
          });
        }
      } catch (verifyError) {
        console.error("Firebase ID token verification failed:", verifyError);
        return res.status(401).json({ message: "Invalid Firebase token" });
      }
    } catch (error) {
      console.error("Firebase sync error:", error);
      return res.status(500).json({ message: "Failed to sync with Firebase" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send a welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to CryptoPilot WebSocket server',
      timestamp: new Date().toISOString()
    }));
    
    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'subscribe':
            // Handle subscription requests (e.g., to crypto price updates)
            ws.send(JSON.stringify({
              type: 'subscription_confirmed',
              channel: data.channel,
              timestamp: new Date().toISOString()
            }));
            break;
            
          default:
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Unknown message type',
              timestamp: new Date().toISOString()
            }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Error processing message',
          timestamp: new Date().toISOString()
        }));
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  return httpServer;
}
