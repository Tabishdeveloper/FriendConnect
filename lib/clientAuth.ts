'use client';

import { createBrowserClient } from '@supabase/ssr';
import { config } from './config';

// Only create the browser client on the client side
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClientSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('createClientSupabaseClient can only be used in the browser');
  }
  
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      config.supabase.url,
      config.supabase.anonKey
    );
  }
  
  return supabaseClient;
} 