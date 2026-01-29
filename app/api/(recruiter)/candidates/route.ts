import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { User } from "@supabase/supabase-js";

interface JobData {
  id: string;
  title: string;
  min_experience_year: number | null;
  max_experience_year: number | null;
  created_by: string;
}

interface CandidateJobMatch {
  id: string;
  overall_match_score: number | null;
  skill_match: number | null;
  experience_score: number | null;
}

interface ApplicationData {
  id: string;
  status: string;
  applied_at: string;
  created_at: string;
  user_id: string;
  asset_id: string | null;
  job: JobData | null;
  candidate_job_match: CandidateJobMatch | null;
}

interface CandidateProfile {
  user_id: string;
  fullname: string | null;
  email: string | null;
  phone: string | null;
}

interface MappedCandidate {
  id: string;
  user_id: string;
  name: string;
  email: string;
  applied_role: string;
  experience: string;
  ai_match: number | null;
  status: string;
  applied_date: string;
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
        { status: 401 },
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
        asset_id,
        job:job_id (
          id,
          title,
          min_experience_year,
          max_experience_year,
          created_by
        ),
        candidate_job_match:candidate_job_match_id (
          id,
          overall_match_score,
          skill_match,
          experience_score
        )
      `,
        { count: "exact" },
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
    const {
      data: applications,
      error,
      count: totalCount,
    } = await query.range(from, to);

    if (error) {
      console.error("Error fetching candidates:", error.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil data kandidat",
          error: { database: [error.message] },
        },
        { status: 500 },
      );
    }

    // Fetch candidate profiles separately
    const userIds = applications?.map((app) => app.user_id) || [];
    const candidatesMap = new Map<string, CandidateProfile>();
    const authUsersMap = new Map<string, User>();

    if (userIds.length > 0) {
      // Fetch from candidate table (for users who completed their profile)
      const { data: candidateProfiles, error: candidateError } = await supabase
        .from("candidate")
        .select("user_id, fullname, email, phone")
        .in("user_id", userIds);

      if (!candidateError && candidateProfiles) {
        (candidateProfiles as CandidateProfile[]).forEach((c) =>
          candidatesMap.set(c.user_id, c),
        );
      }

      // Fetch auth users data for those without candidate profile
      // Get users who don't have candidate profile yet
      const missingUserIds = userIds.filter((id) => !candidatesMap.has(id));

      if (missingUserIds.length > 0) {
        try {
          const adminClient = await createAdminClient();

          // Fetch users using admin client
          const authUsersPromises = missingUserIds.map(async (userId) => {
            try {
              const { data: authUser } =
                await adminClient.auth.admin.getUserById(userId);
              return authUser?.user || null;
            } catch (error) {
              console.error(`Error fetching user ${userId}:`, error);
              return null;
            }
          });

          const authUsers = await Promise.all(authUsersPromises);
          authUsers.forEach((user) => {
            if (user) {
              authUsersMap.set(user.id, user);
            }
          });
        } catch (error) {
          console.error("Error creating admin client:", error);
        }
      }
    }

    // Transform data to match expected format
    const candidates = (
      (applications as unknown as ApplicationData[]) || []
    ).map((app) => {
      const candidate = candidatesMap.get(app.user_id);
      const authUser = authUsersMap.get(app.user_id);
      const job = app.job;

      // Get name with fallback chain: candidate.fullname -> auth user metadata -> email prefix
      let displayName = "Unknown";
      let email = "No email";

      if (candidate?.fullname) {
        displayName = candidate.fullname;
        email = candidate.email || email;
      } else if (authUser) {
        // Try to get display name from auth user metadata
        const metadata = authUser.user_metadata || {};
        displayName =
          metadata.display_name ||
          metadata.full_name ||
          metadata.name ||
          authUser.email?.split("@")[0] ||
          "Unknown";
        email = authUser.email || email;
      }

      // Calculate experience display
      let experience = "Not specified";
      if (
        job?.min_experience_year !== null &&
        job?.max_experience_year !== null
      ) {
        if (job?.min_experience_year === job?.max_experience_year) {
          experience = `${job?.min_experience_year} years`;
        } else {
          experience = `${job?.min_experience_year}-${job?.max_experience_year} years`;
        }
      }

      // // Map status to display format
      // const statusMap: Record<string, string> = {
      //   applied: "New",
      //   pending: "New",
      //   screening: "Screening",
      //   interview: "Interview",
      //   offered: "Offered",
      //   hired: "Hired",
      //   rejected: "Rejected",
      // };

      // Get AI match score from candidate_job_match if available
      const aiMatchScore = app.candidate_job_match?.overall_match_score || null;

      return {
        id: app.id,
        user_id: app.user_id,
        name: displayName,
        email: email,
        applied_role: job?.title || "Unknown Position",
        experience: experience,
        ai_match: aiMatchScore, // Real AI match score from database
        status: app.status,
        asset_id: app.asset_id,
        applied_date:
          app.applied_at?.split("T")[0] || app.created_at?.split("T")[0],
      };
    });

    // Filter candidates to only show those who applied to jobs created by current user
    // This ensures HRD users only see candidates for their own job postings
    let filteredCandidates = candidates.filter((c) => {
      const app = (applications as unknown as ApplicationData[]).find(
        (a) => a.id === c.id
      );
      // Only include if job exists and was created by current user
      return app?.job && app.job.created_by === session.user.id;
    });

    // Apply search filter client-side if needed
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCandidates = filteredCandidates.filter(
        (c: MappedCandidate) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.applied_role.toLowerCase().includes(searchLower),
      );
    }

    // Use filtered candidates count for accurate pagination
    const totalCandidates = filteredCandidates.length;
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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        status: false,
        message: "Failed to fetch candidates",
        error: { server: [errorMessage] },
      },
      { status: 500 },
    );
  }
}
