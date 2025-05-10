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
  
  // Removed Firebase auth state listener since we're not using Firebase authentication
  

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
      // Use local authentication directly (bypassing Firebase)
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
      // Use direct registration with our backend
      const res = await apiRequest("POST", "/api/auth/register", { 
        username, 
        password,
        displayName: displayName || username,
        email: username.includes('@') ? username : null 
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
      
      // Instead of using Firebase Google Auth, notify user to use username/password
      toast({
        title: "Google Login Not Available",
        description: "Please use username/password login instead. Firebase Admin credentials are not configured.",
        variant: "destructive",
      });
      throw new Error("Firebase Admin credentials not configured");
      
    } catch (error: any) {
      console.error("Google login not available:", error);
      toast({
        title: "Google Sign-in Not Available",
        description: "Please use username/password login. Firebase Admin credentials need to be configured.",
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
      
      // Show a message that password reset is not available without Firebase Admin
      toast({
        title: "Password Reset Not Available",
        description: "Please contact the administrator to reset your password.",
        variant: "destructive",
      });
      throw new Error("Password reset not available without Firebase Admin credentials");
    } catch (error: any) {
      console.error("Password reset not available:", error);
      toast({
        title: "Password Reset Not Available",
        description: "Please contact the administrator to reset your password.",
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
      // Logout from server session
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
