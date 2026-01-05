/**
 * Memeriksa apakah environment variables Supabase sudah dikonfigurasi
 * @returns Object dengan status dan pesan error jika ada
 */
export function checkSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      isValid: false,
      error: "Missing Supabase environment variables",
      message:
        "Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    };
  }

  if (!supabaseUrl.startsWith("http")) {
    return {
      isValid: false,
      error: "Invalid Supabase URL",
      message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL starting with http:// or https://",
    };
  }

  return {
    isValid: true,
    error: null,
    message: null,
  };
}

