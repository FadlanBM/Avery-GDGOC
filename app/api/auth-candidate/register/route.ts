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
        { status: 400 },
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
        { status: 400 },
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
        { status: error.status || 400 },
      );
    }

    if (!data.user) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal membuat user",
          error: { auth: ["User object not returned"] },
        },
        { status: 400 },
      );
    }

    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id, name")
      .eq("name", "registrant")
      .single();

    if (roleError || !roleData) {
      console.error(`Error fetching role recruiter:`, roleError);
      return NextResponse.json(
        { error: `Role registrant not found` },
        { status: 500 },
      );
    }

    const { error: insertError } = await supabase.from("user_roles").insert({
      user_id: data.user?.id,
      role_id: roleData.id,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            status: false,
            message: "Role sudah terdaftar",
            error: { role: ["Role already registered"] },
          },
          { status: 400 },
        );
      }
      console.error(`Error assigning role recruiter:`, insertError);
      return NextResponse.json(
        { error: `Failed to assign role recruiter` },
        { status: 500 },
      );
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
      { status: 500 },
    );
  }
}
