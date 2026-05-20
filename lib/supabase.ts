import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser-safe client — uses the anon key, respects RLS
export function createBrowserClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Server-only client — uses the service role key, bypasses RLS.
// Never import this in client components.
export function createServerClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
