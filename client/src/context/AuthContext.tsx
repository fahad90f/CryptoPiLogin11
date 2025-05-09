import React, { createContext, useState, useEffect } from "react";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await res.json();
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      const res = await apiRequest("POST", "/api/auth/register", { username, password });
      const userData = await res.json();
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
