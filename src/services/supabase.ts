import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://huyvxarxyhggmtbwjazw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_M0iXi1mNlEU-hQ1GJgYKpg_w4lDN32Z";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
