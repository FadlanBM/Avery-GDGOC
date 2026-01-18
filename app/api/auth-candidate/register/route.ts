import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin } = new URL(request.url);
    const validation = registerSchema.safeParse(body);

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

    const { email, password, username } = validation.data;
    const supabase = await createClient();

    // Cek apakah email sudah terdaftar di tabel users
    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        {
          status: false,
          message: "Email sudah terdaftar",
          error: { email: ["Email already registered"] },
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          display_name: username,
        },
      },
    });

    if (error) {
      return NextResponse.json(
        {
          status: false,
          message: error.message,
          error: { auth: [error.message] },
        },
        { status: error.status || 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal membuat user",
          error: { auth: ["User object not returned"] },
        },
        { status: 400 }
      );
    }

    // Gunakan upsert untuk menghindari error jika trigger database sudah membuat profile duluan
    const { error: insertError } = await supabase.from("candidate").upsert({
      id: data.user.id,
    });

    if (insertError) {
      console.error("Error inserting user role:", insertError.message);
    }

    return NextResponse.json({
      status: true,
      message: "Registrasi berhasil",
      data,
    });
  } catch (error) {
    console.error("Register error:", error);
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
