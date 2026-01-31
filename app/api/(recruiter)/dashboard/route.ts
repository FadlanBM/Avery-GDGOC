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

        // Get company_id from HRD profile
        const { data: profile, error: profileError } = await supabase
            .from("hrd_employee_data")
            .select("companie_id")
            .eq("user_id", session.user.id)
            .single();

        if (profileError || !profile?.companie_id) {
            return NextResponse.json(
                {
                    status: false,
                    message: "Anda harus terhubung dengan perusahaan untuk melihat dashboard",
                    error: { database: ["No companie_id found for this user"] },
                },
                { status: 403 }
            );
        }

        const companyId = profile.companie_id;

        // Get query params for pagination
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "7");
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // 1. Get all jobs for this company
        const { data: jobs } = await supabase
            .from("job")
            .select("id, title, status")
            .eq("company_id", companyId);

        const jobIds = jobs?.map((job) => job.id) || [];
        const jobTitleMap = new Map(jobs?.map((job) => [job.id, job.title]) || []);

        // Count open jobs
        const openJobs = jobs?.filter((job) => job.status === "published").length || 0;

        // 2. Get total applicants count
        let totalApplicants = 0;
        let interviewsScheduled = 0;
        let avgTimeToHire = 0;

        if (jobIds.length > 0) {
            // Get all applications
            const { data: applications, count } = await supabase
                .from("job_applications")
                .select("id, status, created_at, updated_at, job_id", { count: "exact" })
                .in("job_id", jobIds);

            totalApplicants = count || 0;

            // Count interviews (assuming 'interview' status means interview scheduled)
            interviewsScheduled =
                applications?.filter((app) => app.status === "interview").length || 0;

            // Calculate avg time to hire from hired applications
            const hiredApps = applications?.filter((app) => app.status === "hired") || [];
            if (hiredApps.length > 0) {
                const totalDays = hiredApps.reduce((sum, app) => {
                    const created = new Date(app.created_at);
                    const updated = new Date(app.updated_at || app.created_at);
                    const days = Math.ceil(
                        (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return sum + days;
                }, 0);
                avgTimeToHire = Math.round(totalDays / hiredApps.length);
            }
        }

        // 3. Get recent activities with pagination
        let activities: {
            id: string;
            type: "user" | "ai" | "calendar" | "status";
            description: string;
            timestamp: Date;
            aiPowered: boolean;
        }[] = [];
        let totalActivities = 0;

        if (jobIds.length > 0) {
            const { data: recentApplications, count: activityCount } = await supabase
                .from("job_applications")
                .select(
                    `
          id,
          status,
          created_at,
          updated_at,
          job_id,
          user_id,
          candidate_job_match_id
        `,
                    { count: "exact" }
                )
                .in("job_id", jobIds)
                .order("updated_at", { ascending: false })
                .range(from, to);

            totalActivities = activityCount || 0;

            // Get candidate names for activities
            const userIds = recentApplications?.map((app) => app.user_id) || [];
            let candidateMap = new Map();

            if (userIds.length > 0) {
                const { data: candidates } = await supabase
                    .from("candidate")
                    .select("user_id, fullname")
                    .in("user_id", userIds);

                if (candidates) {
                    candidates.forEach((c) => candidateMap.set(c.user_id, c.fullname));
                }
            }

            // Transform to activities
            activities = (recentApplications || []).map((app) => {
                const candidateName = candidateMap.get(app.user_id) || "Unknown Candidate";
                const jobTitle = jobTitleMap.get(app.job_id) || "Unknown Job";
                const hasAiMatch = !!app.candidate_job_match_id;
                const status = app.status?.toLowerCase() || "applied";

                let type: "user" | "ai" | "calendar" | "status" = "user";
                let description = "";
                let aiPowered = false;

                // Determine activity type and description based on status
                switch (status) {
                    case "applied":
                        type = "user";
                        description = `${candidateName} applied for ${jobTitle}`;
                        break;
                    case "screening":
                        type = "ai";
                        description = `AI Analysis completed for ${candidateName}`;
                        aiPowered = true;
                        break;
                    case "interview":
                        type = "calendar";
                        description = `Interview scheduled with ${candidateName} for ${jobTitle}`;
                        break;
                    case "hired":
                        type = "status";
                        description = `${candidateName} was hired for ${jobTitle}`;
                        break;
                    case "rejected":
                        type = "status";
                        description = `${candidateName} was rejected for ${jobTitle}`;
                        break;
                    default:
                        type = "status";
                        description = `${candidateName} status changed to ${status} for ${jobTitle}`;
                }

                // If has AI match, mark as AI powered
                if (hasAiMatch && status !== "screening") {
                    aiPowered = true;
                }

                return {
                    id: app.id,
                    type,
                    description,
                    timestamp: new Date(app.updated_at || app.created_at),
                    aiPowered,
                };
            });
        }

        // 4. Calculate trends (simplified - comparing to previous period)
        // For now, we'll use placeholder trends. In production, you'd compare periods
        const applicantsTrend = 12; // placeholder
        const interviewsTrend = 8;
        const jobsTrend = 2;
        const timeToHireTrend = -3;

        return NextResponse.json({
            status: true,
            message: "Dashboard data retrieved successfully",
            data: {
                metrics: {
                    totalApplicants,
                    interviewsScheduled,
                    openJobs,
                    avgTimeToHire,
                    applicantsTrend,
                    interviewsTrend,
                    jobsTrend,
                    timeToHireTrend,
                },
                activities,
                totalActivities,
            },
        });
    } catch (err) {
        console.error("Dashboard error:", err);
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
