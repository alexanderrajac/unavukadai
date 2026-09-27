import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'efncxyhwgxozdzcbpgjy';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_REF}.supabase.co`;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseClient = null;

if (SUPABASE_ANON_KEY) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log(`⚡ Supabase client initialized for project: ${SUPABASE_PROJECT_REF}`);
}

export function getSupabaseClient() {
  if (!supabaseClient && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    supabaseClient = createClient(SUPABASE_URL, key);
  }
  return supabaseClient;
}

export { SUPABASE_URL, SUPABASE_PROJECT_REF };
