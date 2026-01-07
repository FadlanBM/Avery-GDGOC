import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const jobSchema = z.object({
  title: z.string().min(1, "Judul pekerjaan wajib diisi").max(255),
  description: z.string().min(1, "Deskripsi pekerjaan wajib diisi"),
  employment_status_id: z
    .string()
    .uuid("Format ID status pekerjaan tidak valid")
    .optional()
    .nullable(),
  work_schedule_id: z.string().uuid("Format ID jadwal kerja tidak valid"),
  remote_status_id: z.string().uuid("Format ID status remote tidak valid"),
  required_education_id: z
    .string()
    .uuid("Format ID tingkat pendidikan tidak valid")
    .optional()
    .nullable(),
  min_experience_years: z.number().int().nonnegative().optional().nullable(),
  max_experience_years: z.number().int().nonnegative().optional().nullable(),
  no_experience_allowed: z.boolean().default(false),
  status: z.enum(["draft", "published", "closed", "filled"]).default("draft"),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Cek Autentikasi & Ambil Profile
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profile?.company_id) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Anda harus terhubung dengan perusahaan untuk membuat lowongan",
          error: { database: ["No company_id found for this user"] },
        },
        { status: 403 }
      );
    }

    // 2. Validasi Body
    const body = await request.json();
    const validation = jobSchema.safeParse(body);

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

    const jobData = validation.data;

    // 3. Insert ke Database
    const { data, error: insertError } = await supabase
      .from("job")
      .insert([
        {
          ...jobData,
          company_id: profile.company_id,
          created_by_user_id: session.user.id,
          published_at:
            jobData.status === "published" ? new Date().toISOString() : null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating job:", insertError.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal menyimpan lowongan pekerjaan",
          error: { database: [insertError.message] },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: true,
      message: "Lowongan pekerjaan berhasil dibuat",
      data,
    });
  } catch (err) {
    console.error("Create job error:", err);
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

// Proteksi Method
export async function GET() {
  return NextResponse.json(
    {
      status: false,
      message: "Method GET tidak tersedia",
      error: { method: ["Not Allowed"] },
    },
    { status: 405 }
  );
}
export async function PUT() {
  return NextResponse.json(
    {
      status: false,
      message: "Method PUT tidak tersedia",
      error: { method: ["Not Allowed"] },
    },
    { status: 405 }
  );
}
export async function DELETE() {
  return NextResponse.json(
    {
      status: false,
      message: "Method DELETE tidak tersedia",
      error: { method: ["Not Allowed"] },
    },
    { status: 405 }
  );
}
