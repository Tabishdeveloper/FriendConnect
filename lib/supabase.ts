import { createClient } from '@supabase/supabase-js';

// Check if Supabase environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Determine if we're running in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return !isDevelopment || 
         (typeof supabaseUrl === 'string' && 
          supabaseUrl.length > 0 && 
          typeof supabaseAnonKey === 'string' && 
          supabaseAnonKey.length > 0);
};

// Create Supabase client
let supabase: any;

if (isSupabaseConfigured()) {
  supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);
} else {
  console.warn(
    'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.',
    'Running in development mode with mocked functionality.'
  );
  
  // Mock Supabase client for development
  supabase = {
    auth: {
      signUp: async () => ({ data: { user: { id: 'mock-user-id', email: 'user@example.com' } }, error: null }),
      signIn: async () => ({ data: { user: { id: 'mock-user-id', email: 'user@example.com' } }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback: any) => {
        callback('SIGNED_IN', { user: { id: 'mock-user-id', email: 'user@example.com' } });
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      getUser: async () => ({ data: { user: { id: 'mock-user-id', email: 'user@example.com' } }, error: null }),
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

export { supabase }; 