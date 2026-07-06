import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://obzzoqghurezcytjzpgq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dk5cSnnx9MFbobvkMeGKug_CUOwXNtT';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
