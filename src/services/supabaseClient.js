import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://syouhbcqbmynmqecgcxd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5b3VoYmNxYm15bm1xZWNnY3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODcyODgsImV4cCI6MjEwMTg2MzI4OH0.-2coth6EEcWxLQInczDKWLYa2_4BUbKbGr4gXiHBS_M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
