import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Cek Autentikasi
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

    // 2. Ambil profile user untuk mendapatkan company_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profile?.company_id) {
      return NextResponse.json(
        {
          status: false,
          message: "User belum terhubung dengan perusahaan manapun",
          error: { database: ["No company_id found for this user"] },
        },
        { status: 404 }
      );
    }

    // 3. Ambil data perusahaan berdasarkan company_id tersebut
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", profile.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        {
          status: false,
          message: "Data perusahaan tidak ditemukan",
          error: {
            database: [companyError?.message || "Company record missing"],
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: true,
      message: "Data perusahaan berhasil diambil",
      data: company,
    });
  } catch (err) {
    console.error("Get company error:", err);
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
