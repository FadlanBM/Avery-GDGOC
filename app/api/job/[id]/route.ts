import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

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

    const { id } = params;

    // Fetch job with all related data
    const { data, error } = await supabase
      .from("job")
      .select(
        `
        id,
        title,
        description,
        status,
        min_experience_years,
        max_experience_years,
        no_experience_allowed,
        created_at,
        updated_at,
        published_at,
        employment_status:employment_status_id(id, name),
        work_schedule:work_schedule_id(id, name),
        remote_status:remote_status_id(id, name),
        education_level:required_education_id(id, name),
        companie:company_id(id, name),
        created_by:created_by_user_id(id, email)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching job:", error.message);
      return NextResponse.json(
        {
          status: false,
          message: "Job not found",
          error: { database: [error.message] },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: true,
      message: "Job retrieved successfully",
      data,
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
