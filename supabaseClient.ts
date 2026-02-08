import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables using Vite standard
// Use safe fallback to prevent crashes if import.meta.env is somehow missing
const env = (import.meta as any).env || {};
let envUrl = env.VITE_SUPABASE_URL;
const envKey = env.VITE_SUPABASE_ANON_KEY;

// Fallback to provided keys if environment variables are missing
// FORCE HTTPS: Netlify/Vercel often block mixed content.
if (!envUrl) {
    envUrl = 'https://tmahfhkuvvjnphynpknu.supabase.co';
} else if (envUrl.startsWith('http://')) {
    envUrl = envUrl.replace('http://', 'https://');
}

const key = envKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtYWhmaGt1dnZqbnBoeW5wa251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODU1MTgsImV4cCI6MjA4NTY2MTUxOH0.BYGXv4qPEgjx_4d5HgvjnaHv8WqHgyYhoO3tfReMnL8';

if (!envUrl || !key) {
  console.error("Supabase configuration missing.");
}

export const supabase = createClient(envUrl, key);