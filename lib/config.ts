/**
 * This file centralizes environment variable access and provides fallbacks
 * for safer builds across different environments
 */

export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
    env: process.env.NODE_ENV || 'development',
  }
};

// Helper to check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return config.supabase.url !== '' && config.supabase.anonKey !== '';
}; 