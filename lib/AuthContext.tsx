'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClientSupabaseClient } from './clientAuth';
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';

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
  const [supabase, setSupabase] = useState<any>(null);
  
  // Initialize Supabase client on the client side only
  useEffect(() => {
    try {
      const client = createClientSupabaseClient();
      setSupabase(client);
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
  }, []);
  
  // Set up auth state listener after Supabase client is initialized
  useEffect(() => {
    if (!supabase) return;
    
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
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        
        if (data.user) {
          const formattedUser = formatUser(data.user);
          setUser(formattedUser);
        }
      } catch (err) {
        console.error('Error getting user:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();

    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Authentication methods
  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    setError(null);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'An error occurred during login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
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
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'An error occurred during signup');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'An error occurred during Google login');
      throw err;
    }
  };

  const logout = async () => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'An error occurred during logout');
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