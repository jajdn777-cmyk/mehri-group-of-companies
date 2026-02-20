import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables using Vite standard
const env = (import.meta as any).env || {};
let envUrl = env.VITE_SUPABASE_URL;
const envKey = env.VITE_SUPABASE_ANON_KEY;

// FORCE HTTPS: Netlify/Vercel often block mixed content.
if (envUrl && envUrl.startsWith('http://')) {
    envUrl = envUrl.replace('http://', 'https://');
}

const key = envKey;

if (!envUrl || !key) {
  console.error("Supabase configuration missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.");
}

export const supabase = createClient(envUrl || '', key || '');
