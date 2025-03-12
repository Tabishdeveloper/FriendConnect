'use client';

import { createBrowserClient } from '@supabase/ssr';

// Only create the browser client on the client side
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClientSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('createClientSupabaseClient can only be used in the browser');
  }
  
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }
  
  return supabaseClient;
} 