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

      // 1. Dapatkan role user dari database
      const { data: existingRoleData } = await supabase
        .from("user_roles")
        .select("roles(name)")
        .eq("user_id", user.id)
        .maybeSingle();

      let currentRole = (existingRoleData?.roles as any)?.name;

      // 2. Jika ada parameter role, tangani penugasan/validasi role
      if (role) {
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
            currentRole = role;
          }
        } else if (currentRole !== role) {
          // Jika role tidak cocok
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

      // 3. Validasi profil berdasarkan role
      let redirectPath = next;

      if (currentRole === "recruiter") {
        const { data: profile, error: profileError } = await supabase
          .from("hrd_employee_data")
          .select("user_id,is_active")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError || !profile) {
          redirectPath = "/recruiter/complete-profile";
        } else if (profile.is_active === false) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/recruiter/login?error=${encodeURIComponent(
              "Akun Anda dinonaktifkan. Silakan hubungi admin.",
            )}`,
          );
        }
      } else if (currentRole === "registrant") {
        // Cek data profil candidate
        const { data: profile, error: profileError } = await supabase
          .from("candidate")
          .select("user_id,is_active")
          .eq("user_id", user.id)
          .maybeSingle();

        // Validasi: jika data candidate tidak ditemukan, redirect ke complete-profile
        if (profileError || !profile) {
          console.log(
            "Candidate profile not found, redirecting to complete-profile",
          );
          redirectPath = "/complete-profile";
        } else if (profile.is_active === false) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/login?error=${encodeURIComponent(
              "Akun Anda dinonaktifkan. Silakan hubungi admin.",
            )}`,
          );
        }
      }

      // Jika path redirect berubah, buat response baru dan salin cookies
      if (redirectPath !== next) {
        const finalResponse = NextResponse.redirect(`${origin}${redirectPath}`);
        // Salin semua cookies dari supabaseResponse ke finalResponse
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          finalResponse.cookies.set(cookie.name, cookie.value);
        });
        return finalResponse;
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
