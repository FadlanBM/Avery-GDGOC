import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

    // Get pagination and filter parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const currentPage = Math.max(1, page);
    const currentLimit = Math.max(1, Math.min(limit, 100));
    const from = (currentPage - 1) * currentLimit;
    const to = from + currentLimit - 1;

    // Build query for job_applications with job data
    let query = supabase
      .from("job_applications")
      .select(
        `
        id,
        status,
        applied_at,
        created_at,
        user_id,
        job:job_id (
          id,
          title,
          min_experience_year,
          max_experience_year
        )
      `,
        { count: "exact" }
      )
      .order("applied_at", { ascending: false });

    // Apply status filter if provided
    if (status) {
      // Map display status to database status
      const statusMap: Record<string, string> = {
        new: "applied",
        screening: "screening",
        interview: "interview",
        offered: "offered",
        hired: "hired",
        rejected: "rejected",
      };
      const dbStatus = statusMap[status.toLowerCase()] || status.toLowerCase();
      query = query.eq("status", dbStatus);
    }

    // Get paginated data with count
    const { data: applications, error, count: totalCount } = await query.range(from, to);

    if (error) {
      console.error("Error fetching candidates:", error.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil data kandidat",
          error: { database: [error.message] },
        },
        { status: 500 }
      );
    }

    // Fetch candidate profiles separately
    const userIds = applications?.map((app) => app.user_id) || [];
    let candidatesMap = new Map();
    let usersMap = new Map();

    if (userIds.length > 0) {
      // Fetch from candidate table (for users who completed their profile)
      const { data: candidateProfiles, error: candidateError } = await supabase
        .from("candidate")
        .select("user_id, fullname, email, phone")
        .in("user_id", userIds);

      if (!candidateError && candidateProfiles) {
        candidateProfiles.forEach((c) => candidatesMap.set(c.user_id, c));
      }

      // Fetch from users table as fallback (for display_name and email)
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email, raw_user_meta_data")
        .in("id", userIds);

      if (!usersError && usersData) {
        usersData.forEach((u) => usersMap.set(u.id, u));
      }
    }

    // Transform data to match expected format
    const candidates = (applications || []).map((app: any) => {
      const candidate = candidatesMap.get(app.user_id);
      const userData = usersMap.get(app.user_id);
      const job = app.job;

      // Get name with fallback chain: candidate.fullname -> user metadata display_name -> email prefix
      let displayName = "Unknown";
      if (candidate?.fullname) {
        displayName = candidate.fullname;
      } else if (userData?.raw_user_meta_data?.display_name) {
        displayName = userData.raw_user_meta_data.display_name;
      } else if (userData?.raw_user_meta_data?.full_name) {
        displayName = userData.raw_user_meta_data.full_name;
      } else if (userData?.email) {
        displayName = userData.email.split("@")[0];
      } else if (candidate?.email) {
        displayName = candidate.email.split("@")[0];
      }

      // Get email with fallback
      const email = candidate?.email || userData?.email || "No email";

      // Calculate experience display
      let experience = "Not specified";
      if (job?.min_experience_year !== null && job?.max_experience_year !== null) {
        if (job.min_experience_year === job.max_experience_year) {
          experience = `${job.min_experience_year} years`;
        } else {
          experience = `${job.min_experience_year}-${job.max_experience_year} years`;
        }
      }

      // Map status to display format
      const statusMap: Record<string, string> = {
        applied: "New",
        pending: "New",
        screening: "Screening",
        interview: "Interview",
        offered: "Offered",
        hired: "Hired",
        rejected: "Rejected",
      };

      return {
        id: app.id,
        user_id: app.user_id,
        name: displayName,
        email: email,
        applied_role: job?.title || "Unknown Position",
        experience: experience,
        ai_match: Math.floor(Math.random() * 30) + 70, // Placeholder for AI match score
        status: statusMap[app.status] || app.status,
        applied_date: app.applied_at?.split("T")[0] || app.created_at?.split("T")[0],
      };
    });

    // Apply search filter client-side if needed
    let filteredCandidates = candidates;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCandidates = candidates.filter(
        (c: any) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.applied_role.toLowerCase().includes(searchLower)
      );
    }

    const totalCandidates = totalCount || 0;
    const totalPages = Math.ceil(totalCandidates / currentLimit);

    return NextResponse.json({
      status: true,
      message: "Candidates retrieved successfully",
      data: filteredCandidates,
      pagination: {
        currentPage: currentPage,
        totalPages,
        totalCandidates,
        itemsPerPage: currentLimit,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching candidates:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        status: false,
        message: "Failed to fetch candidates",
        error: { server: [errorMessage] },
      },
      { status: 500 }
    );
  }
}
