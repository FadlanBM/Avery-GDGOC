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
        { status: 401 },
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
          message:
            "Anda harus terhubung dengan perusahaan untuk melihat analytics",
          error: { database: ["No companie_id found for this user"] },
        },
        { status: 403 },
      );
    }

    const companyId = profile.companie_id;

    // Get query params for date filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Calculate default date range (last 30 days) if not provided
    const currentEndDate = endDate ? new Date(endDate) : new Date();
    const currentStartDate = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));

    // Calculate previous period for comparison
    const daysDiff = Math.ceil(
      (currentEndDate.getTime() - currentStartDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const previousEndDate = new Date(currentStartDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff);

    // 1. Get all jobs for this company
    const { data: jobs, error: jobsError } = await supabase
      .from("job")
      .select("id, title")
      .eq("company_id", companyId);
    console.log(jobs);

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil data pekerjaan",
          error: { database: [jobsError.message] },
        },
        { status: 400 },
      );
    }

    const jobIds = jobs?.map((job) => job.id) || [];

    // If no jobs, return empty analytics
    if (jobIds.length === 0) {
      return NextResponse.json({
        status: true,
        message: "Analytics data retrieved successfully",
        data: {
          isEmpty: true,
          metrics: {
            totalApplications: 0,
            activeJobs: 0,
            avgTimeToHire: 0,
            hiredCount: 0,
            avgMatchScore: 0,
            successRate: 0,
            totalApplicationsPrevious: 0,
            activeJobsPrevious: 0,
            hiredCountPrevious: 0,
          },
          hiringFunnel: {
            applied: 0,
            screening: 0,
            interview: 0,
            offer: 0,
            hired: 0,
          },
          topJobs: [],
          applicationTrends: {
            current: [],
            previous: [],
          },
          dateRange: {
            startDate: currentStartDate.toISOString(),
            endDate: currentEndDate.toISOString(),
            previousStartDate: previousStartDate.toISOString(),
            previousEndDate: previousEndDate.toISOString(),
          },
        },
      });
    }

    // 2. Get hiring funnel data (current period)
    const { data: funnelData, error: funnelError } = await supabase
      .from("job_applications")
      .select("status,candidate_job_match_id,job_id")
      .in("job_id", jobIds);

    if (funnelError) {
      console.error("Error fetching funnel data:", funnelError);
    }

    // Count by status
    const funnelCounts = {
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      hired: 0,
    };

    const jobStats: Record<
      string,
      {
        id: string;
        title: string;
        applicantCount: number;
        hiredCount: number;
        totalMatchScore: number;
        matchScoreCount: number;
      }
    > = {};

    funnelData?.forEach((item) => {
      const status = item.status?.toLowerCase() || "applied";
      if (status in funnelCounts) {
        funnelCounts[status as keyof typeof funnelCounts]++;
      }

      // Populate jobStats
      const jobId = item.job_id;
      if (jobId) {
        if (!jobStats[jobId]) {
          const jobTitle =
            jobs?.find((j) => j.id === jobId)?.title || "Unknown Job";
          jobStats[jobId] = {
            id: jobId,
            title: jobTitle,
            applicantCount: 0,
            hiredCount: 0,
            totalMatchScore: 0,
            matchScoreCount: 0,
          };
        }
        jobStats[jobId].applicantCount++;
        if (status === "hired") {
          jobStats[jobId].hiredCount++;
        }
      }
    });

    const candidateJobMatch =
      funnelData?.map((job) => job.candidate_job_match_id) || [];

    // 3. Count matches
    const validMatchIds = candidateJobMatch.filter((id) => id);
    const { count: matchCount } = await supabase
      .from("candidate_job_match")
      .select("id", { count: "exact", head: true })
      .in("id", validMatchIds);

    if (matchCount !== null) {
      funnelCounts.screening = matchCount;
    }

    // Aggregate by job
    // jobStats populated above

    const topJobs = Object.values(jobStats)
      .map((job) => ({
        id: job.id,
        title: job.title,
        applicantCount: job.applicantCount,
        hiredCount: job.hiredCount,
        avgMatchScore:
          job.matchScoreCount > 0
            ? Math.round(job.totalMatchScore / job.matchScoreCount)
            : 0,
        conversionRate:
          job.applicantCount > 0
            ? Math.round((job.hiredCount / job.applicantCount) * 100)
            : 0,
      }))
      .sort((a, b) => b.applicantCount - a.applicantCount)
      .slice(0, 10);

    // 4. Get application trends (daily counts for current period)
    const { data: trendsData, error: trendsError } = await supabase
      .from("job_applications")
      .select("created_at")
      .in("job_id", jobIds)
      .gte("created_at", currentStartDate.toISOString())
      .lte("created_at", currentEndDate.toISOString())
      .order("created_at", { ascending: true });

    if (trendsError) {
      console.error("Error fetching trends data:", trendsError);
    }

    // Group by date
    const dailyCounts: Record<string, number> = {};
    trendsData?.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const currentTrends = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    }));

    // 5. Get previous period trends
    const { data: previousTrendsData, error: previousTrendsError } =
      await supabase
        .from("job_applications")
        .select("created_at")
        .in("job_id", jobIds)
        .gte("created_at", previousStartDate.toISOString())
        .lte("created_at", previousEndDate.toISOString())
        .order("created_at", { ascending: true });

    if (previousTrendsError) {
      console.error("Error fetching previous trends:", previousTrendsError);
    }

    const previousDailyCounts: Record<string, number> = {};
    previousTrendsData?.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0];
      previousDailyCounts[date] = (previousDailyCounts[date] || 0) + 1;
    });

    const previousTrends = Object.entries(previousDailyCounts).map(
      ([date, count]) => ({
        date,
        count,
      }),
    );

    // 6. Calculate metrics
    const totalApplications = funnelData?.length || 0;
    const hiredCount = Object.values(jobStats).reduce(
      (sum, job) => sum + job.hiredCount,
      0,
    );

    // Get previous period metrics for comparison
    const { data: previousApplications } = await supabase
      .from("candidate_job_match")
      .select("status")
      .in("id", candidateJobMatch)
      .gte("created_at", previousStartDate.toISOString())
      .lte("created_at", previousEndDate.toISOString());

    const totalApplicationsPrevious = previousApplications?.length || 0;
    const hiredCountPrevious =
      previousApplications?.filter(
        (item) => item.status?.toLowerCase() === "hired",
      ).length || 0;

    // Get active jobs count (current period)
    const { data: activeJobsData } = await supabase
      .from("job")
      .select("id", { count: "exact" })
      .eq("company_id", companyId)
      .eq("status", "published")
      .gte("created_at", currentStartDate.toISOString())
      .lte("created_at", currentEndDate.toISOString());

    const activeJobs = activeJobsData?.length || 0;

    // Get active jobs previous period
    const { data: activeJobsPreviousData } = await supabase
      .from("job")
      .select("id", { count: "exact" })
      .eq("company_id", companyId)
      .eq("status", "published")
      .gte("created_at", previousStartDate.toISOString())
      .lte("created_at", previousEndDate.toISOString());

    const activeJobsPrevious = activeJobsPreviousData?.length || 0;

    // Calculate average match score
    const { data: matchScores } = await supabase
      .from("candidate_job_match")
      .select("skill_match")
      .in("id", candidateJobMatch)
      .gte("created_at", currentStartDate.toISOString())
      .lte("created_at", currentEndDate.toISOString())
      .not("skill_match", "is", null);
    console.log(matchScores);

    const avgMatchScore =
      matchScores && matchScores.length > 0
        ? Math.round(
            matchScores.reduce(
              (sum, item) => sum + (item.skill_match || 0),
              0,
            ) / matchScores.length,
          )
        : 0;

    // Calculate time to hire (simplified - days from applied to hired)
    const { data: hiredApplications } = await supabase
      .from("job_applications")
      .select("created_at, updated_at")
      .in("job_id", jobIds)
      .eq("status", "hired")
      .gte("created_at", currentStartDate.toISOString())
      .lte("created_at", currentEndDate.toISOString());
    console.log(hiredApplications);

    let avgTimeToHire = 0;
    if (hiredApplications && hiredApplications.length > 0) {
      const totalDays = hiredApplications.reduce((sum, item) => {
        const created = new Date(item.created_at);
        const updated = new Date(item.updated_at || item.created_at);
        const days = Math.ceil(
          (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
        );
        return sum + days;
      }, 0);
      avgTimeToHire = Math.round(totalDays / hiredApplications.length);
    }

    const successRate =
      totalApplications > 0
        ? Math.round((hiredCount / totalApplications) * 100)
        : 0;
    console.log(successRate);

    return NextResponse.json({
      status: true,
      message: "Analytics data retrieved successfully",
      data: {
        isEmpty: false,
        metrics: {
          totalApplications,
          activeJobs,
          avgTimeToHire,
          hiredCount,
          avgMatchScore,
          successRate,
          totalApplicationsPrevious,
          activeJobsPrevious,
          hiredCountPrevious,
        },
        hiringFunnel: funnelCounts,
        topJobs,
        applicationTrends: {
          current: currentTrends,
          previous: previousTrends,
        },
        dateRange: {
          startDate: currentStartDate.toISOString(),
          endDate: currentEndDate.toISOString(),
          previousStartDate: previousStartDate.toISOString(),
          previousEndDate: previousEndDate.toISOString(),
        },
      },
    });
  } catch (err) {
    console.error("Analytics error:", err);
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
