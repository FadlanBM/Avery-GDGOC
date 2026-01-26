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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const roleValidation = await validateUserRole(
      supabase,
      user.id,
      "registrant",
    );
    if (!roleValidation.isValid) {
      return roleValidation.response;
    }

    const { id } = await params;
    const validation = paramsSchema.safeParse({ id });

    if (!validation.success) {
      const flattenedErrors = validation.error.flatten().fieldErrors;
      const firstErrorMessage = validation.error.issues[0].message;
      return NextResponse.json(
        {
          status: false,
          message: firstErrorMessage,
          error: flattenedErrors,
        },
        { status: 400 },
      );
    }

    const job_id = validation.data.id;

    const { data: jobData, error: jobError } = await supabase
      .from("job")
      .select("id, status")
      .eq("id", job_id)
      .maybeSingle();

    if (jobError) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal memvalidasi pekerjaan",
          error: { database: [jobError.message] },
        },
        { status: 500 },
      );
    }

    if (!jobData) {
      return NextResponse.json(
        {
          status: false,
          message: "Pekerjaan tidak ditemukan",
          error: { job_id: ["Job not found"] },
        },
        { status: 404 },
      );
    }

    const { data: existingApplication, error: duplicateError } = await supabase
      .from("job_applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("job_id", job_id)
      .maybeSingle();

    if (duplicateError) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal memvalidasi aplikasi sebelumnya",
          error: { database: [duplicateError.message] },
        },
        { status: 500 },
      );
    }

    if (existingApplication) {
      return NextResponse.json(
        {
          status: false,
          message: "Anda sudah melamar pekerjaan ini sebelumnya",
          error: { application: ["Duplicate application"] },
        },
        { status: 400 },
      );
    }

    const applicationId = crypto.randomUUID();
    const currentTime = new Date().toISOString();
    const { error: insertError } = await supabase
      .from("job_applications")
      .insert({
        id: applicationId,
        user_id: user.id,
        job_id: job_id,
        applied_at: currentTime,
        status: "panding",
        created_at: currentTime,
        updated_at: currentTime,
      });

    if (insertError) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengirim lamaran",
          error: { database: [insertError.message] },
        },
        { status: 500 },
      );
    }

    // 7. Insert Status Log
    const logId = crypto.randomUUID();
    const { error: logError } = await supabase
      .from("job_application_status_log")
      .insert({
        id: logId,
        job_application_id: applicationId,
        message_status: "HRD sudah menerima lamaranmu",
        changed_by: user.id,
        changed_at: currentTime,
      });

    if (logError) {
      console.error("Failed to insert status log:", logError);
    }

    return NextResponse.json({
      status: true,
      message: "Lamaran berhasil dikirim",
      data: {
        application_id: applicationId,
        job_id: job_id,
        status: "pending",
        applied_at: currentTime,
      },
    });
  } catch (error) {
    console.error("Apply job error:", error);
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { status: 401 }
      );
    }

    // 2. Role Check (Must be registrant)
    const roleValidation = await validateUserRole(
      supabase,
      user.id,
      "registrant"
    );
    if (!roleValidation.isValid) {
      return roleValidation.response;
    }

    // 3. Check if application exists and belongs to user
    const { data: application, error: appError } = await supabase
      .from("job_applications")
      .select("id, user_id, status")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (appError || !application) {
      return NextResponse.json(
        {
          status: false,
          message: "Lamaran tidak ditemukan atau bukan milik Anda",
          error: { database: ["Application not found"] },
        },
        { status: 404 }
      );
    }

    // 4. Check if application can be withdrawn (only applied/pending status can be withdrawn)
    const withdrawableStatuses = ["applied", "pending"];
    if (!withdrawableStatuses.includes(application.status)) {
      return NextResponse.json(
        {
          status: false,
          message: "Lamaran tidak dapat dibatalkan karena sudah diproses",
          error: { validation: ["Application already processed"] },
        },
        { status: 400 }
      );
    }

    // 5. Delete the application
    const { error: deleteError } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting job application:", deleteError.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal membatalkan lamaran",
          error: { database: [deleteError.message] },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: true,
      message: "Lamaran berhasil dibatalkan",
    });
  } catch (error) {
    console.error("Delete job application error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        status: false,
        message: "Terjadi kesalahan internal server",
        error: { server: [errorMessage] },
      },
      { status: 500 }
    );
  }
}
