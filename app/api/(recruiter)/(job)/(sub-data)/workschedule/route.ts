import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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
        { status: 401 }
      );
    }

    // Mengambil semua data dari tabel "education"
    // .select("*") akan mengembalikan array of objects
    const { data, error } = await supabase
      .from("work_schedule")
      .select("id,name")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching education list:", error.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil data pendidikan",
          error: { database: [error.message] },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: true,
      message: "Data pendidikan berhasil diambil",
      data: data || [], // Pastikan selalu mengembalikan array meskipun kosong
    });
  } catch (err) {
    console.error("Education list error:", err);
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

export async function POST() {
  return NextResponse.json(
    {
      status: false,
      message: "Method POST tidak tersedia untuk rute ini",
      error: { method: ["Method Not Allowed"] },
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      status: false,
      message: "Method PUT tidak tersedia untuk rute ini",
      error: { method: ["Method Not Allowed"] },
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      status: false,
      message: "Method DELETE tidak tersedia untuk rute ini",
      error: { method: ["Method Not Allowed"] },
    },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      status: false,
      message: "Method PATCH tidak tersedia untuk rute ini",
      error: { method: ["Method Not Allowed"] },
    },
    { status: 405 }
  );
}
