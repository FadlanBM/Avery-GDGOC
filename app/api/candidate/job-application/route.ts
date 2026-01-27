import { createClient } from "@/lib/supabase/server";
import { validateUserRole } from "@/lib/validations/auth-check";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Auth Check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          status: false,
          message: "Unauthorized: Silakan login terlebih dahulu",
          error: { auth: [authError?.message || "User not found"] },
        },
        { status: 401 },
      );
    }

    // 2. Role Check (Must be registrant)
    const roleValidation = await validateUserRole(
      supabase,
      user.id,
      "registrant",
    );
    if (!roleValidation.isValid) {
      return roleValidation.response;
    }

    // 3. Get Pagination Params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const searchQuery = searchParams.get("search"); // search by job title or company name

    const currentPage = Math.max(1, page);
    const currentLimit = Math.max(1, Math.min(limit, 100));
    const from = (currentPage - 1) * currentLimit;
    const to = from + currentLimit - 1;

    // 4. Query Job Applications with Relations
    let query = supabase
      .from("job_applications")
      .select(
        `
        id,
        status,
        applied_at,
        created_at,
        updated_at,
        job:job_id (
          id,
          title,
          description,
          status,
          min_experience_year,
          max_experience_year,
          no_experience_allowed,
          employment_status:employment_status_id(id, name),
          work_schedule:work_schedule_id(id, name),
          remote_status:remote_status_id(id, name),
          education_level:required_education_id(id, name),
          companie:company_id(id, name)
        )
      `,
        { count: "exact" },
      )
      .eq("user_id", user.id);

    if (status) {
      query = query.eq("status", status);
    }

    // Note: For search on joined tables, we'll filter client-side after fetching
    // This is because Supabase doesn't support filtering on nested relations directly
    const needsClientSideSearch = searchQuery && searchQuery.trim();

    const { data, error, count } = await query
      .order("applied_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching job applications:", error.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil daftar lamaran kerja",
          error: { database: [error.message] },
        },
        { status: 400 },
      );
    }

    // Client-side filtering for search on nested job data
    let filteredData = data || [];
    if (needsClientSideSearch && searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredData = filteredData.filter((app: any) => {
        const jobTitle = app.job?.title?.toLowerCase() || "";
        const companyName = app.job?.companie?.name?.toLowerCase() || "";
        return jobTitle.includes(searchLower) || companyName.includes(searchLower);
      });
    }

    const totalItems = needsClientSideSearch ? filteredData.length : (count || 0);
    const totalPages = Math.ceil(totalItems / currentLimit);

    return NextResponse.json({
      status: true,
      message: "Daftar lamaran kerja berhasil diambil",
      data: filteredData,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Get job applications error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        status: false,
        message: "Terjadi kesalahan internal server",
        error: { server: [errorMessage] },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Auth Check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          status: false,
          message: "Unauthorized: Silakan login terlebih dahulu",
          error: { auth: [authError?.message || "User not found"] },
        },
        { status: 401 },
      );
    }

    // 2. Role Check (Must be registrant)
    const roleValidation = await validateUserRole(
      supabase,
      user.id,
      "registrant",
    );
    if (!roleValidation.isValid) {
      return roleValidation.response;
    }

    // 3. Parse Request Body
    const body = await request.json();
    const { job_id } = body;

    if (!job_id) {
      return NextResponse.json(
        {
          status: false,
          message: "Job ID wajib diisi",
          error: { validation: ["Missing job_id"] },
        },
        { status: 400 },
      );
    }

    // 4. Check if job exists and is published
    const { data: job, error: jobError } = await supabase
      .from("job")
      .select("id, status")
      .eq("id", job_id)
      .maybeSingle();

    if (jobError || !job) {
      return NextResponse.json(
        {
          status: false,
          message: "Lowongan tidak ditemukan",
          error: { database: ["Job not found"] },
        },
        { status: 404 },
      );
    }

    if (job.status !== "published") {
      return NextResponse.json(
        {
          status: false,
          message: "Lowongan ini tidak tersedia untuk dilamar",
          error: { validation: ["Job is not published"] },
        },
        { status: 400 },
      );
    }

    // 5. Check if already applied
    const { data: existingApplication } = await supabase
      .from("job_applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("job_id", job_id)
      .maybeSingle();

    if (existingApplication) {
      return NextResponse.json(
        {
          status: false,
          message: "Anda sudah melamar pada lowongan ini",
          error: { validation: ["Already applied"] },
        },
        { status: 400 },
      );
    }

    // 6. Check if candidate has a primary CV
    const { data: candidateCV, error: cvError } = await supabase
      .from("candidate_cv")
      .select("asset_id")
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .maybeSingle();

    if (cvError || !candidateCV) {
      return NextResponse.json(
        {
          status: false,
          message: "Silakan unggah dan pilih CV utama terlebih dahulu",
          error: { validation: ["Primary CV not found"] },
        },
        { status: 400 },
      );
    }

    // 7. Create Job Application
    const currentTime = new Date().toISOString();
    const { data: application, error: insertError } = await supabase
      .from("job_applications")
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        job_id: job_id,
        status: "applied",
        asset_id: candidateCV.asset_id,
        applied_at: currentTime,  
        created_at: currentTime,
        updated_at: currentTime,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Error creating job application:", insertError.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengirim lamaran",
          error: { database: [insertError.message] },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Lamaran berhasil dikirim",
      data: {
        application_id: application.id,
      },
    });
  } catch (error) {
    console.error("Create job application error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        status: false,
        message: "Terjadi kesalahan internal server",
        error: { server: [errorMessage] },
      },
      { status: 500 },
    );
  }
}
