import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { validateUserRole } from "@/lib/validations/auth-check";

const paramsSchema = z.object({
  id: z.string().uuid("ID tidak valid"),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    // 3. Validation Params
    const { id } = await params;
    const validation = paramsSchema.safeParse({ id });

    if (!validation.success) {
      return NextResponse.json(
        {
          status: false,
          message: validation.error.issues[0].message,
          error: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const application_id = validation.data.id;

    // 4. Get Job Application Detail with Relations
    const { data: application, error: fetchError } = await supabase
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
        ),
        job_application_status_log (
          id,
          message_status,
          changed_at,
          changed_by
        )
      `,
      )
      .eq("id", application_id)
      .eq("user_id", user.id) // Ensure only owner can access
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        {
          status: false,
          message: "Data lamaran tidak ditemukan",
          error: { database: [fetchError?.message || "Record not found"] },
        },
        { status: 404 },
      );
    }

    // Sort logs by date ascending (paling lama ke terbaru)
    if (application.job_application_status_log) {
      (application.job_application_status_log as any[]).sort(
        (a, b) =>
          new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime(),
      );
    }

    return NextResponse.json({
      status: true,
      message: "Detail lamaran berhasil diambil",
      data: application,
    });
  } catch (error) {
    console.error("Get job application detail error:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Terjadi kesalahan internal server",
        error: {
          server: [error instanceof Error ? error.message : "Unknown error"],
        },
      },
      { status: 500 },
    );
  }
}


