'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClientSupabaseClient } from './clientAuth';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Define the User type
export interface User {
  uid: string;
  email: string | undefined;
  displayName: string | undefined;
  photoURL?: string;
}

// Define the context types
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Supabase user to our app's user model
const formatUser = (user: SupabaseUser | null): User | null => {
  if (!user) return null;
  
  return {
    uid: user.id,
    email: user.email,
    displayName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    photoURL: user.user_metadata?.avatar_url,
  };
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createClientSupabaseClient());

  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          const formattedUser = formatUser(currentSession.user);
          setUser(formattedUser);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Initialize user state
    const initializeUser = async () => {
      const { data: { user: currentUser, session: currentSession } } = await supabase.auth.getUser();
      setSession(currentSession);
      
      if (currentUser) {
        const formattedUser = formatUser(currentUser);
        setUser(formattedUser);
      }
      
      setLoading(false);
    };

    initializeUser();

    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Authentication methods
  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      setLoading(false);
      throw err;
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: displayName,
          },
        },
      });
      
      if (error) throw error;
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
      setLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google login');
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An error occurred during logout');
      throw err;
    }
  };

  // Context value
  const value = {
    user,
    session,
    loading,
    error,
    login,
    signup,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the provider
export default AuthProvider; 