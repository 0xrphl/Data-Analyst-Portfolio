import { createClient } from '@supabase/supabase-js';

const AGORA_URL = import.meta.env.VITE_AGORA_SUPABASE_URL || 'https://ohidinrnomoyvzpighos.supabase.co';
const AGORA_ANON = import.meta.env.VITE_AGORA_SUPABASE_ANON_KEY || 'sb_publishable_jhCUR3cb7V9cBK3y3fYrng_zUPdGUsd';

export const supabaseAgora = createClient(AGORA_URL, AGORA_ANON);
