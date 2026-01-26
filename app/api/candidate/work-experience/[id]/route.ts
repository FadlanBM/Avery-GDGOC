import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const workExperienceSchema = z.object({
  work_type: z.string().min(1, "Tipe pekerjaan wajib diisi").optional(),
  work_name: z.string().min(1, "Nama pekerjaan wajib diisi").optional(),
  company_name: z.string().min(1, "Nama perusahaan wajib diisi").optional(),
  start_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Format tanggal mulai tidak valid",
    })
    .optional(),
  end_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Format tanggal selesai tidak valid",
    })
    .optional(),
  internship: z.boolean().optional(),
  description: z.string().min(1, "Deskripsi wajib diisi").optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    // 2. Fetch specific work experience
    const { data, error } = await supabase
      .from("work_experience")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

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

    if (!data) {
      return NextResponse.json(
        {
          status: false,
          message: "Data pengalaman kerja tidak ditemukan",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Data pengalaman kerja berhasil diambil",
      data: data,
    });
  } catch (error) {
    console.error("GET Single Work Experience Error:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    // 2. Validate Request Body
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

    // 3. Update in database
    const { data, error } = await supabase
      .from("work_experience")
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal memperbarui data pengalaman kerja",
          error: error.message,
        },
        { status: 400 },
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Data pengalaman kerja tidak ditemukan atau Anda tidak memiliki akses",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Pengalaman kerja berhasil diperbarui",
      data: data,
    });
  } catch (error) {
    console.error("PATCH Work Experience Error:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    // 2. Delete from database
    const { error } = await supabase
      .from("work_experience")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal menghapus data pengalaman kerja",
          error: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Pengalaman kerja berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE Work Experience Error:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
