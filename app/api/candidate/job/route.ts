import { createClient } from "@/lib/supabase/server";
import { validateUserRole } from "@/lib/validations/auth-check";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Allow guest access - no authentication required for viewing jobs
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If user is authenticated, verify they are a candidate
    if (session) {
      const roleValidation = await validateUserRole(
        supabase,
        session?.user?.id,
        "registrant",
      );

      if (!roleValidation.isValid) {
        return roleValidation.response;
      }
    }

    // Ambil parameter pagination dari URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Validasi parameter agar tidak negatif
    const currentPage = Math.max(1, page);
    const currentLimit = Math.max(1, Math.min(limit, 100));

    // Hitung range untuk Supabase
    const from = (currentPage - 1) * currentLimit;
    const to = from + currentLimit - 1;

    // Get status filter from query params (optional)
    const statusFilter = searchParams.get("status");
    const searchQuery = searchParams.get("search"); // search by title or description

    let query = supabase.from("job").select(
      `
        id,
        title,
        status,
        created_at,
        description,
        min_experience_year,
        max_experience_year,
        no_experience_allowed,
        employment_status:employment_status_id(id, name),
        work_schedule:work_schedule_id(id, name),
        remote_status:remote_status_id(id, name),
        education_level:required_education_id(id, name)
      `,
      { count: "exact" },
    );

    // Apply status filter only if provided
    if (
      statusFilter &&
      ["draft", "published", "closed", "filled"].includes(statusFilter)
    ) {
      query = query.eq("status", statusFilter);
    }

    // Apply search filter if provided (search by title or description)
    if (searchQuery && searchQuery.trim()) {
      query = query.or(
        `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
      );
    }

    const { data, error, count } = await query
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
        { status: 400 },
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
      { status: 500 },
    );
  }
}
