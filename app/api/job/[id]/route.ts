import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("=== GET /api/job/[id] called ===");
  console.log("Request URL:", request.url);
  
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("Session check:", session ? "Logged in" : "Not logged in");

    if (!session) {
      return NextResponse.json(
        {
          status: false,
          message: "Unauthorized: Please login first",
          error: { auth: ["Session not found"] },
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    console.log("Job ID:", id);

    // Fetch job with all related data
    const { data, error } = await supabase
      .from("job")
      .select(
        `
        id,
        title,
        description,
        status,
        min_experience_year,
        max_experience_year,
        no_experience_allowed,
        created_at,
        updated_at,
        published_at,
        created_by,
        employment_status:employment_status_id(id, name),
        work_schedule:work_schedule_id(id, name),
        remote_status:remote_status_id(id, name),
        education_level:required_education_id(id, name),
        companie:company_id(id, name)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching job:", error);
      return NextResponse.json(
        {
          status: false,
          message: "Job not found",
          error: { database: [error.message] },
        },
        { status: 404 }
      );
    }

    // Fetch creator user info separately if needed
    let creatorEmail = null;
    if (data.created_by) {
      const { data: userData } = await supabase.auth.admin.getUserById(data.created_by);
      creatorEmail = userData?.user?.email || null;
    }

    return NextResponse.json({
      status: true,
      message: "Job retrieved successfully",
      data: {
        ...data,
        created_by: data.created_by ? {
          id: data.created_by,
          email: creatorEmail,
        } : null,
      },
    });
  } catch (err) {
    console.error("Get job error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
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
