import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Output a helpful config warning if env keys are missing during development
if (
  process.env.NODE_ENV === "development" &&
  (supabaseUrl.includes("placeholder") || supabaseAnonKey.includes("placeholder"))
) {
  console.warn(
    "GLYPH WARNING: Supabase credentials are not fully configured in your environment (.env). " +
    "GitHub OAuth and database saves will run in offline simulation mode."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
