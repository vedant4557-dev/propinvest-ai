import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser singleton
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ─── Database types ──────────────────────────────────────────────────────────

export interface DbDeal {
  id: string;
  user_id: string;
  name: string;
  saved_at: string;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
}
