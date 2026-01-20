import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const role = requestUrl.searchParams.get("role"); // role dari provider (registrant/recruiter)
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const origin = requestUrl.origin;

  // Jika ada error dari OAuth provider
  if (error) {
    const errorMessage =
      errorDescription || "Terjadi kesalahan saat autentikasi";
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorMessage)}`,
    );
  }

  // Jika ada code, exchange untuk session
  if (code) {
    const supabaseResponse = NextResponse.redirect(`${origin}${next}`);

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
      },
    );

    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`,
      );
    }

    // Verifikasi bahwa session berhasil dibuat
    if (data?.session) {
      const user = data.user;

      // Jika ada parameter role, coba pasangkan role ke user jika belum punya
      if (role && user) {
        // Cek role user saat ini
        const { data: existingRoleData } = await supabase
          .from("user_roles")
          .select("roles(name)")
          .eq("user_id", user.id)
          .maybeSingle();

        const currentRole = (existingRoleData?.roles as any)?.name;

        if (!currentRole) {
          // Jika belum punya role, pasangkan role yang diminta
          const { data: roleData } = await supabase
            .from("roles")
            .select("id")
            .eq("name", role)
            .single();

          if (roleData) {
            await supabase.from("user_roles").insert({
              user_id: user.id,
              role_id: roleData.id,
            });
          }
        } else if (currentRole !== role) {
          // Jika role tidak cocok (misal: registrant mencoba login di jalur recruiter)
          await supabase.auth.signOut();
          const loginPath =
            role === "recruiter" ? "/recruiter/login" : "/login";
          return NextResponse.redirect(
            `${origin}${loginPath}?error=${encodeURIComponent(
              `Akun Anda terdaftar sebagai ${currentRole}. Silakan gunakan jalur login yang sesuai.`,
            )}`,
          );
        }
      }

      return supabaseResponse;
    } else {
      console.error("No session created after code exchange");
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("Gagal membuat session")}`,
      );
    }
  }

  // Jika tidak ada code, redirect ke login
  return NextResponse.redirect(`${origin}/login`);
}
