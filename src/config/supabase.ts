import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "SUPABASE_URL dan SUPABASE_SERVICE_KEY wajib diisi di .env untuk upload sertifikat.",
  );
}

// Client dengan service_role key -> hanya untuk backend (punya akses penuh ke storage).
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET ?? "certificates";