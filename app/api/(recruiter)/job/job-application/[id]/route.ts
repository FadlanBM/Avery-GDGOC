import { createClient } from "@/lib/supabase/server";
import { validateUserRole } from "@/lib/validations/auth-check";
import { NextResponse } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid("ID Lamaran tidak valid"),
});

export async function GET(
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

    // 2. Role Check (Must be recruiter or admin)
    const roleValidation = await validateUserRole(supabase, user.id, [
      "recruiter",
      "admin",
    ]);
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

    console.log(validation.data.id);

    const { data, error } = await supabase
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
      .eq("id", validation.data.id)
      .maybeSingle();

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

    if (!data) {
      return NextResponse.json(
        {
          status: false,
          message: "Data lamaran tidak ditemukan",
          error: { database: ["Record not found"] },
        },
        { status: 404 },
      );
    }

    // 5. Fetch Candidate Profiles Manually
    const { data: candidates, error: candidateError } = await supabase
      .from("candidate")
      .select(
        `
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
      .eq("user_id", data?.user_id)
      .maybeSingle();

    if (candidateError) {
      console.error("Error fetching job applications:", candidateError.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil daftar pelamar",
          error: { database: [candidateError.message] },
        },
        { status: 400 },
      );
    }

    const {
      data: job_application_status_log,
      error: job_application_status_log_error,
    } = await supabase
      .from("job_application_status_log")
      .select(
        `
          message_status,
          changed_by,
          changed_at
        `,
      )
      .eq("job_application_id", data?.id)
      .order("changed_at", { ascending: false });

    if (job_application_status_log_error) {
      console.error(
        "Error fetching job applications:",
        job_application_status_log_error.message,
      );
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil daftar pelamar",
          error: { database: [job_application_status_log_error.message] },
        },
        { status: 400 },
      );
    }

    const { data: cv } = await supabase
      .from("candidate_cv")
      .select("asset_id, assets!inner(storage_path)")
      .eq("user_id", data?.user_id)
      .eq("is_primary", true)
      .single();

    return NextResponse.json({
      status: true,
      message: "Daftar pelamar berhasil diambil",
      data: {
        ...data,
        candidate: candidates,
        cv: cv,
        status_log: job_application_status_log,
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
export async function PATCH(
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

    // Role Check (Must be recruiter or admin)
    const roleValidation = await validateUserRole(supabase, user.id, [
      "recruiter",
      "admin",
    ]);
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

    // Parse request body
    const body = await request.json();
    const { status: newStatus } = body;

    // Validate status value
    const allowedStatuses = ["applied", "interview", "hired", "rejected"];
    if (!newStatus || !allowedStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          status: false,
          message: "Status tidak valid",
          error: { status: [`Status harus salah satu dari: ${allowedStatuses.join(", ")}`] },
        },
        { status: 400 },
      );
    }

    // Get current application to check if it exists
    const { data: currentApplication, error: fetchError } = await supabase
      .from("job_applications")
      .select("id, status")
      .eq("id", validation.data.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching application:", fetchError.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil data lamaran",
          error: { database: [fetchError.message] },
        },
        { status: 400 },
      );
    }

    if (!currentApplication) {
      return NextResponse.json(
        {
          status: false,
          message: "Data lamaran tidak ditemukan",
          error: { database: ["Record not found"] },
        },
        { status: 404 },
      );
    }

    // Update application status
    const { data: updatedApplication, error: updateError } = await supabase
      .from("job_applications")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validation.data.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating application status:", updateError.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengubah status lamaran",
          error: { database: [updateError.message] },
        },
        { status: 400 },
      );
    }

    // Log status change
    const { error: logError } = await supabase
      .from("job_application_status_log")
      .insert({
        job_application_id: validation.data.id,
        message_status: `Status changed from ${currentApplication.status} to ${newStatus}`,
        changed_by: user.id,
        changed_at: new Date().toISOString(),
      });

    if (logError) {
      console.error("Error logging status change:", logError.message);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      status: true,
      message: "Status lamaran berhasil diubah",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Update application status error:", error);
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
