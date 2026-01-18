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

const jobUpdateSchema = jobSchema.partial();

export async function POST(request: Request) {
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
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("hrd_employee_data")
      .select("companie_id")
      .eq("user_id", session.user.id)
      .single();

    if (profileError || !profile?.companie_id) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Anda harus terhubung dengan perusahaan untuk membuat lowongan",
          error: { database: ["No companie_id found for this user"] },
        },
        { status: 403 }
      );
    }

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
    const { data, error: insertError } = await supabase
      .from("job")
      .insert([
        {
          ...jobData,
          company_id: profile.companie_id,
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

export async function GET(request: Request) {
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
        { status: 401 }
      );
    }

    // Ambil parameter pagination dari URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Validasi parameter agar tidak negatif
    const currentPage = Math.max(1, page);
    const currentLimit = Math.max(1, Math.min(limit, 100)); // Batasi maksimal 100 per halaman

    // Hitung range untuk Supabase
    const from = (currentPage - 1) * currentLimit;
    const to = from + currentLimit - 1;

    const { data, error, count } = await supabase
      .from("job")
      .select(
        `
        id,
        title,
        status,
        created_at,
        description,
        min_experience_years,
        max_experience_years,
        no_experience_allowed,
        employment_status:employment_status_id(id, name),
        work_schedule:work_schedule_id(id, name),
        remote_status:remote_status_id(id, name),
        education_level:required_education_id(id, name)
      `,
        { count: "exact" }
      )
      .eq("created_by_user_id", session.user.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching job list:", error.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil daftar lowongan pekerjaan",
          error: { database: [error.message] },
        },
        { status: 400 }
      );
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / currentLimit);
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;

    // Jika halaman yang diminta melebihi total halaman, kembalikan data kosong
    const finalData = currentPage > totalPages ? [] : data || [];

    return NextResponse.json({
      status: true,
      message: "Daftar lowongan pekerjaan berhasil diambil",
      data: finalData,
      pagination: {
        current_page: currentPage,
        next_page: nextPage,
        limit: currentLimit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    });
  } catch (err) {
    console.error("Education list error:", err);
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
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          status: false,
          message: "ID lowongan tidak ditemukan di parameter",
          error: { params: ["ID is required"] },
        },
        { status: 400 }
      );
    }

    // 3. Validasi Body dengan Zod
    const body = await request.json();
    const validation = jobUpdateSchema.safeParse(body);

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

    const updateData = validation.data;

    // 4. Update data dengan filter owner
    const { data, error } = await supabase
      .from("job")
      .update({
        ...updateData,
        published_at:
          updateData.status === "published" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .eq("created_by_user_id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating job:", error.message);
      return NextResponse.json(
        {
          status: false,
          message:
            "Gagal memperbarui lowongan pekerjaan atau Anda tidak memiliki akses",
          error: { database: [error.message] },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: true,
      message: "Lowongan pekerjaan berhasil diperbarui",
      data,
    });
  } catch (err) {
    console.error("Update job error:", err);
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
