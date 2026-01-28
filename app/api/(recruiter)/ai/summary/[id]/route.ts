import { createClient } from "@/lib/supabase/server";
import { validateUserRole } from "@/lib/validations/auth-check";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
        { status: 401 },
      );
    }

    // 2. Role Check (Must be recruiter)
    const roleValidation = await validateUserRole(
      supabase,
      user.id,
      "recruiter",
    );
    if (!roleValidation.isValid) {
      return roleValidation.response;
    }

    // 3. Get Match Data
    const { data: matchData, error: matchError } = await supabase
      .from("candidate_job_match")
      .select("*")
      .eq("id", id)
      .single();

    if (matchError || !matchData) {
      return NextResponse.json(
        {
          status: false,
          message: "Data summary ai tidak ditemukan",
          error: { database: [matchError?.message || "Record not found"] },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Data kecocokan berhasil diambil",
      data: matchData,
    });
  } catch (error) {
    console.error("Get match data error:", error);
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
