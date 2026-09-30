import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("YOUR-PROJECT")) return null;
  if (!client) client = createClient(url, key);
  return client;
}

export type Wish = {
  id: string;
  name: string;
  message: string;
  created_at: string;
  updated_at?: string | null;
};

export const WISH_COLUMNS = "id,name,message,created_at,updated_at";
