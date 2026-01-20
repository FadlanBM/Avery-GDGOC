import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Gunakan getSession dulu untuk cek apakah ada session aktif tanpa memicu refresh error yang berisik
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        {
          status: false,
          message: "Unauthorized: Silakan login terlebih dahulu",
          error: { auth: ["Session not found"] },
        },
        { status: 401 },
      );
    }

    // Jika ada session, baru ambil user secara detail (ini lebih aman)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Jika tidak ada user atau terjadi error (misal token tidak valid/expired)
    if (error || !user) {
      return NextResponse.json(
        {
          status: false,
          message: "Unauthorized: Silakan login terlebih dahulu",
          error: { auth: [error?.message || "User not found"] },
        },
        { status: 401 },
      );
    }

    // Validasi Role Recruiter
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id)
      .maybeSingle();

    const userRole = (roleData?.roles as any)?.name;

    if (roleError || userRole !== "recruiter") {
      return NextResponse.json(
        {
          status: false,
          message: "Forbidden: Anda tidak memiliki akses ke area recruiter",
          error: { auth: ["Invalid role access"] },
        },
        { status: 403 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("hrd_employee_data")
      .select(
        "user_id,fullname, gender, dateofbirth, address, position, is_active",
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.user_id) {
      return NextResponse.json(
        {
          status: false,
          message: "Data profil belum tersedia. Silakan lengkapi profil Anda.",
          error: { auth: ["Profile data not found"] },
        },
        { status: 403 },
      );
    }

    if (profileError) {
      return NextResponse.json(
        {
          status: false,
          message: "Unauthorized: Silakan login terlebih dahulu",
          error: { auth: [profileError || "User not found"] },
        },
        { status: 401 },
      );
    }

    // Jika berhasil, kembalikan data user lengkap dengan profil
    return NextResponse.json({
      status: true,
      message: "Data user berhasil diambil",
      data: {
        id: user.id,
        email: user.email,
        fullname: profile.fullname,
        gender: profile.gender,
        dateofbirth: profile.dateofbirth,
        address: profile.address,
        position: profile.position,
        is_active: profile.is_active,
        avatar: user.user_metadata?.avatar_url || null,
        last_sign_in: user.last_sign_in_at,
      },
    });
  } catch (err) {
    console.error("Error in /api/auth/me:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Terjadi kesalahan internal server";

    return NextResponse.json(
      {
        status: false,
        message: "Internal Server Error",
        error: { server: [errorMessage] },
      },
      { status: 500 },
    );
  }
}
