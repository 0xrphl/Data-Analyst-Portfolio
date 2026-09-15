import { createClient } from '@supabase/supabase-js';

const AGORA_URL = import.meta.env.VITE_AGORA_SUPABASE_URL;
const AGORA_ANON = import.meta.env.VITE_AGORA_SUPABASE_ANON_KEY;

export const supabaseAgora = createClient(AGORA_URL, AGORA_ANON);

