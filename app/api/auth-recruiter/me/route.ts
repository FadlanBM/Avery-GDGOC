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
        { status: 401 }
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
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          status: false,
          message: "Unauthorized: Silakan login terlebih dahulu",
          error: { auth: [profileError?.message || "User not found"] },
        },
        { status: 401 }
      );
    }

    // Jika berhasil, kembalikan data user lengkap dengan profil
    return NextResponse.json({
      status: true,
      message: "Data user berhasil diambil",
      user: {
        id: user.id,
        email: user.email,
        name: profile.full_name || user.user_metadata?.full_name || null,
        role: profile.role,
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
      { status: 500 }
    );
  }
}
