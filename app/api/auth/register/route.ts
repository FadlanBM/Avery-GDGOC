import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
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

    const { email, password, name } = validation.data;
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          full_name: name,
          display_name: name,
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
    const { error: insertError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      role: "recruiter",
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
