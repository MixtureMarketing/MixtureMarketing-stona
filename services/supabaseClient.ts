import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Use the new publishable key name or fallback to the standard anon key
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Key is missing. Check your .env.local file.');
}

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '');
