'use client';

import { createBrowserClient } from '@supabase/ssr';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return (
    typeof supabaseUrl === 'string' && 
    supabaseUrl.length > 0 && 
    typeof supabaseAnonKey === 'string' && 
    supabaseAnonKey.length > 0
  );
};

// Create Supabase client - only initialize on the client side
let supabase: any;

if (isBrowser) {
  if (isSupabaseConfigured()) {
    supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  } else {
    console.warn(
      'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.',
      'Running in development mode with mocked functionality.'
    );
    
    // Mock Supabase client for development
    supabase = {
      auth: {
        signUp: async () => ({ data: { user: { id: 'mock-user-id', email: 'user@example.com' } }, error: null }),
        signInWithPassword: async () => ({ data: { user: { id: 'mock-user-id', email: 'user@example.com' } }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: (callback: any) => {
          callback('SIGNED_IN', { user: { id: 'mock-user-id', email: 'user@example.com' } });
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        getUser: async () => ({ data: { user: { id: 'mock-user-id', email: 'user@example.com', user_metadata: {} } }, error: null }),
        getSession: async () => ({ data: { session: { user: { id: 'mock-user-id', email: 'user@example.com' } } }, error: null }),
      },
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            data: [],
            error: null,
          }),
          order: () => ({
            limit: () => ({
              data: [],
              error: null,
            }),
          }),
        }),
        insert: () => ({ data: { id: 'mock-id' }, error: null }),
        update: () => ({ data: {}, error: null }),
        delete: () => ({ data: {}, error: null }),
      }),
      storage: {
        from: (bucket: string) => ({
          upload: async (path: string, file: any) => ({ data: { path }, error: null }),
          getPublicUrl: (path: string) => ({ data: { publicUrl: `/mockStorage/${path}` } }),
        }),
      },
      channel: (channelName: string) => ({
        on: () => ({
          subscribe: (callback: any) => ({ unsubscribe: () => {} }),
        }),
      }),
    };
  }
}

export { supabase }; 