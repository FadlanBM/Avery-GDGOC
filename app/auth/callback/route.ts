import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const origin = requestUrl.origin;

  // Jika ada error dari OAuth provider
  if (error) {
    const errorMessage = errorDescription || "Terjadi kesalahan saat autentikasi";
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorMessage)}`
    );
  }

  // Jika ada code, exchange untuk session
  if (code) {
    const supabaseResponse = NextResponse.redirect(`${origin}/dashboard`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              supabaseResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    // Verifikasi bahwa session berhasil dibuat
    if (data?.session) {
      return supabaseResponse;
    } else {
      console.error("No session created after code exchange");
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("Gagal membuat session")}`
      );
    }
  }

  // Jika tidak ada code, redirect ke login
  return NextResponse.redirect(`${origin}/login`);
}
