import React, { createContext, useState, useEffect } from "react";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { 
  signInWithGoogle, 
  loginWithEmailPassword, 
  registerWithEmailPassword, 
  logoutUser, 
  resetPassword,
  auth
} from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const isAuthenticated = !!user;
  
  useEffect(() => {
    // Check if user is already logged in
    async function fetchCurrentUser() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCurrentUser();
  }, []);
  
  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser && !isAuthenticated) {
        try {
          // If we have a Firebase user but no server user, sync them
          await syncFirebaseUserWithBackend(firebaseUser);
        } catch (error) {
          console.error("Error syncing Firebase user:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Sync Firebase user with our backend
  async function syncFirebaseUserWithBackend(firebaseUser: FirebaseUser) {
    try {
      setIsLoading(true);
      const idToken = await firebaseUser.getIdToken();
      
      const response = await fetch("/api/auth/firebase-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          idToken,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync Firebase user with backend");
      }
      
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Failed to sync Firebase user with backend:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to sync your account with our servers.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }
  
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      // First try to login via Firebase if it's an email
      if (username.includes('@')) {
        try {
          const firebaseUser = await loginWithEmailPassword(username, password);
          if (firebaseUser) {
            await syncFirebaseUserWithBackend(firebaseUser);
            return;
          }
        } catch (firebaseError: any) {
          console.error("Firebase login failed, falling back to local:", firebaseError);
          
          // Don't fallback if it's a Firebase specific error like "email not verified"
          if (firebaseError.code === "auth/user-not-found" ||
              firebaseError.code === "auth/wrong-password") {
            // Likely a local user, continue to local login
          } else {
            throw firebaseError;
          }
        }
      }
      
      // Fall back to local authentication
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await res.json();
      setUser(userData);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (username: string, password: string, displayName?: string) => {
    setIsLoading(true);
    
    try {
      // If username is an email, try to register with Firebase first
      if (username.includes('@')) {
        try {
          const firebaseUser = await registerWithEmailPassword(
            username, 
            password, 
            displayName || username.split('@')[0]
          );
          if (firebaseUser) {
            await syncFirebaseUserWithBackend(firebaseUser);
            
            toast({
              title: "Account Created",
              description: "Please check your email to verify your account.",
            });
            return;
          }
        } catch (firebaseError: any) {
          console.error("Firebase registration failed, falling back to local:", firebaseError);
          // If it's a Firebase specific error like "email already in use", don't try local
          if (firebaseError.code === "auth/email-already-in-use") {
            throw firebaseError;
          }
        }
      }
      
      // Fall back to local registration
      const res = await apiRequest("POST", "/api/auth/register", { 
        username, 
        password,
        displayName: displayName || username 
      });
      const userData = await res.json();
      setUser(userData);
      
      toast({
        title: "Account Created",
        description: "Your account has been created successfully.",
      });
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again with different credentials.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      const firebaseUser = await signInWithGoogle();
      if (firebaseUser) {
        await syncFirebaseUserWithBackend(firebaseUser);
        toast({
          title: "Welcome!",
          description: "You have successfully signed in with Google.",
        });
      }
    } catch (error: any) {
      console.error("Google login failed:", error);
      toast({
        title: "Google Sign-in Failed",
        description: error.message || "Failed to sign in with Google.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      setIsLoading(true);
      await resetPassword(email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for instructions to reset your password.",
      });
    } catch (error: any) {
      console.error("Password reset failed:", error);
      toast({
        title: "Password Reset Failed",
        description: error.message || "Failed to send password reset email.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Logout from Firebase if user is logged in
      try {
        await logoutUser();
      } catch (firebaseError) {
        console.error("Firebase logout error:", firebaseError);
      }
      
      // Always logout from server session
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to log out.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        loginWithGoogle,
        sendPasswordReset,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
