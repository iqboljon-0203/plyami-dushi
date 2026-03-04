import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isProjectPaused = (error) => {
  return error && (error.status === 522 || error.message?.includes('522') || error.message?.includes('socket hang up'));
};
