// src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// ✅ Environment variables (Vite syntax)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ Create and export client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
