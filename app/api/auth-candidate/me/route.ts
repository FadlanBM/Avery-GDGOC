import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
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

    // Validasi Role Registrant
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id)
      .maybeSingle();

    const userRole = (roleData?.roles as any)?.name;

    if (roleError || userRole !== "registrant") {
      return NextResponse.json(
        {
          status: false,
          message: "Forbidden: Anda tidak memiliki akses ke area candidate",
          error: { auth: ["Invalid role access"] },
        },
        { status: 403 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("candidate")
      .select("fullname, email, phone, gender, dateofbirth, address, is_active")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      if (profileError.code === "42703") {
        return NextResponse.json(
          {
            status: true,
            message:
              "Data profil belum tersedia. Silakan lengkapi profil Anda.",
            profile: false,
          },
          { status: 200 },
        );
      }
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil data profil",
          error: { database: [profileError.message] },
        },
        { status: 400 },
      );
    }

    // Validasi jika akun tidak aktif
    if (profile?.is_active === false) {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          status: false,
          message: "Akun Anda dinonaktifkan. Silakan hubungi admin.",
          error: { auth: ["Account is inactive"] },
        },
        { status: 403 },
      );
    }

    // Jika berhasil, kembalikan data user lengkap dengan profil
    return NextResponse.json({
      status: true,
      message: "Data user berhasil diambil",
      data: {
        id: user.id,
        email: user.email,
        name: profile?.fullname || user.user_metadata?.full_name || null,
        avatar: user.user_metadata?.avatar_url || null,
        last_sign_in: user.last_sign_in_at,
        role: userRole,
        profile: {
          phone: profile?.phone,
          gender: profile?.gender,
          birth_date: profile?.dateofbirth,
          address: profile?.address,
        },
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

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          status: false,
          message: "Unauthorized: Silakan login terlebih dahulu",
          error: { auth: [userError?.message || "User not found"] },
        },
        { status: 401 },
      );
    }

    // Validasi Role Registrant
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id)
      .maybeSingle();

    const userRole = (roleData?.roles as any)?.name;

    if (roleError || userRole !== "registrant") {
      return NextResponse.json(
        {
          status: false,
          message: "Forbidden: Anda tidak memiliki akses ke area candidate",
          error: { auth: ["Invalid role access"] },
        },
        { status: 403 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { fullname, gender, dateofbirth, address, phone } = body;

    // Validate required fields
    if (!fullname || !phone) {
      return NextResponse.json(
        {
          status: false,
          message: "Fullname dan phone wajib diisi",
          error: { validation: ["Missing required fields"] },
        },
        { status: 400 },
      );
    }

    // Update candidate profile
    const { error: updateError } = await supabase
      .from("candidate")
      .update({
        fullname: fullname,
        gender: gender,
        dateofbirth: dateofbirth,
        address: address,
        phone: phone,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengupdate profil",
          error: { database: [updateError.message] },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Profil berhasil diupdate",
    });
  } catch (err) {
    console.error("Error in PUT /api/auth-candidate/me:", err);
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
