import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { config } from './config';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Read-only cookies in middleware
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Read-only cookies in middleware
          }
        },
      },
    }
  );
}

export async function getServerSession() {
  const supabase = createServerSupabaseClient();
  return supabase.auth.getSession();
}

export async function getServerUser() {
  const { data: { session } } = await getServerSession();
  return session?.user ?? null;
} 