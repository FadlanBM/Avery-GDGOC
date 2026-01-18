import { createAdminClient, createClient } from "@/lib/supabase/server";
import { Phone } from "lucide-react";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().min(10, "Nomor telepon minimal 10 karakter"),
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

    const { email, password, username, phone } = validation.data;
    const supabase = await createClient();
    const supabaseAdmin = await createAdminClient();

    const { data: listUserData, error: userError } =
      await supabaseAdmin.auth.admin.listUsers();

    const existingUser = listUserData?.users.find(
      (user) => user.email === email,
    );

    if (userError) {
      console.error(`Error listing users:`, userError);
      return NextResponse.json(
        {
          status: false,
          message: `Error listing users:, ${userError.message}`,
          error: { email: [`Error listing users:, ${userError.message}`] },
        },
        { status: 400 },
      );
    }

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
          full_name: username,
          phone: phone,
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
      .eq("name", "recruiter")
      .single();

    if (roleError || !roleData) {
      console.error(`Error fetching role recruiter:`, roleError);
      return NextResponse.json(
        { error: `Role recruiter not found` },
        { status: 500 },
      );
    }

    // Validasi apakah user sudah terdaftar di user_roles
    const { data: existingUserRole, error: checkRoleError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", data.user?.id)
      .maybeSingle();

    if (checkRoleError) {
      console.error(`Error checking existing role:`, checkRoleError);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal memvalidasi role user",
          error: { role: [checkRoleError.message] },
        },
        { status: 500 },
      );
    }

    if (existingUserRole) {
      return NextResponse.json(
        {
          status: false,
          message: "User sudah terdaftar dengan role tertentu",
          error: { role: ["User already has a role assigned"] },
        },
        { status: 400 },
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
      data: {
        ...data,
        role: roleData.name,
      },
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
