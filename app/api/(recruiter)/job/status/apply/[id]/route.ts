import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { validateUserRole } from "@/lib/validations/auth-check";

const paramsSchema = z.object({
  id: z.string().uuid("ID Lamaran tidak valid"),
});

export async function PATCH({ params }: { params: Promise<{ id: string }> }) {
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

    const application_id = validation.data.id;
    const { data: currentApp, error: fetchError } = await supabase
      .from("job_applications")
      .select("status, user_id")
      .eq("id", application_id)
      .single();

    if (fetchError || !currentApp) {
      return NextResponse.json(
        {
          status: false,
          message: "Lamaran tidak ditemukan",
          error: { database: ["Record not found"] },
        },
        { status: 404 },
      );
    }

    if (currentApp.status === "rejected") {
      return NextResponse.json(
        {
          status: false,
          message: "Lamaran ini sudah ditolak sebelumnya",
        },
        { status: 400 },
      );
    }

    if (currentApp.status === "apply") {
      return NextResponse.json(
        {
          status: false,
          message: "Lamaran ini sudah diterima",
        },
        { status: 400 },
      );
    }

    const newStatus = "apply";
    const currentTime = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("job_applications")
      .update({
        status: newStatus,
        updated_at: currentTime,
      })
      .eq("id", application_id);

    if (updateError) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal memperbarui status lamaran",
          error: { database: [updateError.message] },
        },
        { status: 500 },
      );
    }

    const message = "Lamaranmu direview lebih lanjut";
    const logId = crypto.randomUUID();
    const { error: logError } = await supabase
      .from("job_application_status_log")
      .insert({
        id: logId,
        job_application_id: application_id,
        changed_by: user.id,
        changed_at: currentTime,
        message_status: message,
      });

    if (logError) {
      console.error("Failed to insert status log:", logError);
    }

    return NextResponse.json({
      status: true,
      message: "Lamaran berhasil diterima",
      data: {
        application_id,
        status: newStatus,
        message: message,
      },
    });
  } catch (error) {
    console.error("Accept application error:", error);
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
