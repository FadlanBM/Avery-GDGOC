import { createClient } from "@/lib/supabase/server";
import { validateUserRole } from "@/lib/validations/auth-check";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
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

    // 2. Role Check (Must be recruiter or admin)
    const roleValidation = await validateUserRole(supabase, user.id, [
      "recruiter",
      "admin",
    ]);
    if (!roleValidation.isValid) {
      return roleValidation.response;
    }

    // 3. Get Params
    const { searchParams } = new URL(request.url);
    const job_id = searchParams.get("job_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    if (!job_id) {
      return NextResponse.json(
        {
          status: false,
          message: "Job ID is required",
          error: { job_id: ["Job ID is missing"] },
        },
        { status: 400 },
      );
    }

    const currentPage = Math.max(1, page);
    const currentLimit = Math.max(1, Math.min(limit, 100));
    const from = (currentPage - 1) * currentLimit;
    const to = from + currentLimit - 1;

    let query = supabase
      .from("job_applications")
      .select(
        `
        id,
        status,
        applied_at,
        created_at,
        updated_at,
        user_id
      `,
        { count: "exact" },
      )
      .eq("job_id", job_id);

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query
      .order("applied_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching job applications:", error.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil daftar pelamar",
          error: { database: [error.message] },
        },
        { status: 400 },
      );
    }

    // 5. Fetch Candidate Profiles Manually
    const userIds = data?.map((app) => app.user_id) || [];

    let candidatesMap = new Map();

    if (userIds.length > 0) {
      const { data: candidates, error: candidateError } = await supabase
        .from("candidate")
        .select(
          `
           user_id,
           fullname,
           gender,
           dateofbirth,
           address,
           education_level:last_education(
            id,
            name
           )
        `,
        )
        .eq("user_id", userIds);

      if (!candidateError && candidates) {
        candidates.forEach((c) => candidatesMap.set(c.user_id, c));
      }
    }

    const transformedData = data?.map((app) => {
      const candidateProfile = candidatesMap.get(app.user_id) || null;

      return {
        ...app,
        candidate: candidateProfile,
      };
    });

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / currentLimit);

    return NextResponse.json({
      status: true,
      message: "Daftar pelamar berhasil diambil",
      data: transformedData || [],
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Get job applicants error:", error);
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
