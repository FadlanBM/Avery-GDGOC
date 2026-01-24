import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { validateUserRole } from "@/lib/validations/auth-check";

const applyJobSchema = z.object({
  job_id: z.string().uuid("ID Pekerjaan tidak valid"),
});

export async function POST(request: Request) {
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

    // 3. Validation Body
    const body = await request.json();
    const validation = applyJobSchema.safeParse(body);

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

    const { job_id } = validation.data;

    // 4. Check if job exists and is published (optional check)
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

    // Opsional: Cek apakah job statusnya published/open
    // if (jobData.status !== 'published') { ... }

    // 5. Check duplicate application
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

    // 6. Insert Application
    const applicationId = crypto.randomUUID();
    const currentTime = new Date().toISOString();

    const { error: insertError } = await supabase
      .from("job_applications")
      .insert({
        id: applicationId,
        user_id: user.id,
        job_id: job_id,
        applied_at: currentTime,
        status: "pending",
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
