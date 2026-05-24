import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Appen kjører fint uten Supabase (lokale seed-data). Når begge variablene
// er satt (Bolt setter dem automatisk når du kobler til Supabase), slås
// database, innlogging og lagring på.
export const SUPABASE_ENABLED = Boolean(url && anonKey);

export const supabase = SUPABASE_ENABLED ? createClient(url, anonKey) : null;
