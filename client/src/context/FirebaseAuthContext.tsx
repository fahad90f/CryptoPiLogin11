import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  registerWithEmailPassword,
  loginWithEmailPassword,
  logoutUser,
  resetPassword,
  getCurrentUser
} from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface FirebaseAuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<User | null>;
  createUserWithEmailAndPassword: (email: string, password: string, displayName: string) => Promise<User | null>;
  signInWithGooglePopup: () => Promise<User | null>;
  logout: () => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
  syncUserWithBackend: (user: User) => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const syncUserWithBackend = async (user: User) => {
    if (!user) return;

    try {
      // Get ID token
      const idToken = await user.getIdToken();

      // Send token to backend to either verify the session or create a new user
      await apiRequest('POST', '/api/auth/firebase-sync', {
        idToken,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      });
    } catch (error) {
      console.error('Failed to sync user with backend:', error);
      toast({
        title: 'Authentication Error',
        description: 'Failed to synchronize your account with our servers.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        try {
          await syncUserWithBackend(user);
        } catch (error) {
          console.error('Error syncing user with backend:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await loginWithEmailPassword(email, password);
      if (user) {
        await syncUserWithBackend(user);
      }
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'Failed to login with email and password.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createUserWithEmailAndPassword = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      const user = await registerWithEmailPassword(email, password, displayName);
      if (user) {
        await syncUserWithBackend(user);
        toast({
          title: 'Verification Email Sent',
          description: 'Please check your email to verify your account.',
        });
      }
      return user;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to register with email and password.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGooglePopup = async () => {
    try {
      setLoading(true);
      const user = await signInWithGoogle();
      if (user) {
        await syncUserWithBackend(user);
      }
      return user;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: 'Google Sign-in Failed',
        description: error.message || 'Failed to sign in with Google.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      // Also logout from backend session
      await apiRequest('POST', '/api/auth/logout');
      return true;
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Failed',
        description: error.message || 'Failed to logout.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      setLoading(true);
      await resetPassword(email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for instructions to reset your password.',
      });
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Password Reset Failed',
        description: error.message || 'Failed to send password reset email.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithGooglePopup,
    logout,
    sendPasswordResetEmail,
    syncUserWithBackend
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}