import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const educationSchema = z.object({
  level: z.string().min(1, "Jenjang pendidikan wajib diisi"),
  institution_name: z.string().min(1, "Nama institusi wajib diisi"),
  field_of_study: z.string().min(1, "Bidang studi wajib diisi"),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Format tanggal mulai tidak valid",
  }),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Format tanggal selesai tidak valid",
  }),
  description: z.string().min(1, "Deskripsi wajib diisi"),
});

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Get Authentication User
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          status: false,
          message: "Unauthorized: Silakan login terlebih dahulu",
        },
        { status: 401 },
      );
    }

    // 2. Fetch all education for this user
    const { data, error } = await supabase
      .from("education")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil data pendidikan",
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Data pendidikan berhasil diambil",
      data: data,
    });
  } catch (error) {
    console.error("GET Education Error:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Get Authentication User
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          status: false,
          message: "Unauthorized: Silakan login terlebih dahulu",
        },
        { status: 401 },
      );
    }

    // 2. Validate Role (Must be registrant)
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id)
      .maybeSingle();

    const userRole = (roleData?.roles as any)?.name;

    if (userRole !== "registrant") {
      return NextResponse.json(
        {
          status: false,
          message:
            "Forbidden: Anda tidak memiliki akses untuk menambah data pendidikan",
        },
        { status: 403 },
      );
    }

    // 3. Validate Request Body
    const body = await request.json();
    const validation = educationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          status: false,
          message: validation.error.issues[0].message,
          error: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      level,
      institution_name,
      field_of_study,
      start_date,
      end_date,
      description,
    } = validation.data;

    // 4. Insert into database
    const { error: insertError } = await supabase.from("education").insert({
      user_id: user.id,
      level,
      institution_name,
      field_of_study,
      start_date,
      end_date,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal menyimpan data pendidikan",
          error: insertError.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Data pendidikan berhasil ditambahkan",
    });
  } catch (error) {
    console.error("POST Education Error:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
