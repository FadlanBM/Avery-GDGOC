import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      const flattenedErrors = validation.error.flatten().fieldErrors;
      const firstErrorMessage = validation.error.issues[0].message;

      return NextResponse.json(
        {
          status: false,
          message: firstErrorMessage,
          error: flattenedErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email),
      password: String(password),
    });

    if (error) {
      return NextResponse.json(
        {
          status: false,
          message: error.message,
          error: { auth: [error.message] },
        },
        { status: error.status || 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          status: false,
          message: "Data profil belum tersedia. Silakan lengkapi profil Anda.",
          error: { auth: ["Profile data not found"] },
        },
        { status: 403 }
      );
    }

    // Validasi jika akun tidak aktif
    if (profile.is_active === false) {
      await supabase.auth.signOut();

      return NextResponse.json(
        {
          status: false,
          message: "Akun Anda dinonaktifkan. Silakan hubungi admin.",
          error: { auth: ["Account is inactive"] },
        },
        { status: 403 } // Forbidden
      );
    }

    return NextResponse.json({
      status: true,
      message: "Login berhasil",
      data,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan internal server";

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
