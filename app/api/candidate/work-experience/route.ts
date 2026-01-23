import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const workExperienceSchema = z.object({
  work_type: z.string().min(1, "Tipe pekerjaan wajib diisi"),
  work_name: z.string().min(1, "Nama pekerjaan wajib diisi"),
  company_name: z.string().min(1, "Nama perusahaan wajib diisi"),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Format tanggal mulai tidak valid",
  }),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Format tanggal selesai tidak valid",
  }),
  internship: z.boolean(),
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

    // 2. Fetch all work experience for this user
    const { data, error } = await supabase
      .from("work_experience")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil data pengalaman kerja",
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Data pengalaman kerja berhasil diambil",
      data: data,
    });
  } catch (error) {
    console.error("GET Work Experience Error:", error);
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
            "Forbidden: Anda tidak memiliki akses untuk menambah pengalaman kerja",
        },
        { status: 403 },
      );
    }

    // 3. Validate Request Body
    const body = await request.json();
    const validation = workExperienceSchema.safeParse(body);

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
      work_type,
      work_name,
      company_name,
      start_date,
      end_date,
      internship,
      description,
    } = validation.data;

    // 4. Insert into database
    const { error: insertError } = await supabase
      .from("work_experience")
      .insert({
        user_id: user.id,
        work_type,
        work_name,
        company_name,
        start_date,
        end_date,
        internship,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal menyimpan data pengalaman kerja",
          error: insertError.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Pengalaman kerja berhasil ditambahkan",
    });
  } catch (error) {
    console.error("POST Work Experience Error:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
