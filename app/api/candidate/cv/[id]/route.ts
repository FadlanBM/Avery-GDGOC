import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Auth Check
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

    const body = await request.json();

    // 2. Verify CV ownership
    const { data: cv, error: cvError } = await supabase
      .from("candidate_cv")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (cvError || !cv) {
      return NextResponse.json(
        {
          status: false,
          message: "CV tidak ditemukan atau bukan milik Anda",
        },
        { status: 404 }
      );
    }

    // 3. If setting as primary, remove primary flag from other CVs
    if (body.is_primary === true) {
      await supabase
        .from("candidate_cv")
        .update({ is_primary: false, updated_at: new Date().toISOString() })
        .eq("user_id", session.user.id)
        .neq("id", id);
    }

    // 4. Update the CV
    const { error: updateError } = await supabase
      .from("candidate_cv")
      .update({
        is_primary: body.is_primary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengupdate CV",
          error: { database: [updateError.message] },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: true,
      message: "CV berhasil diupdate",
    });
  } catch (error) {
    console.error("Update CV error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Auth Check
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

    // 2. Get Candidate CV and Asset Data
    // Kita perlu mengambil data asset untuk mendapatkan storage path agar bisa menghapus file fisik
    const { data: cvData, error: cvError } = await supabase
      .from("candidate_cv")
      .select(`
        id,
        user_id,
        asset_id,
        assets (
          id,
          storage_path
        )
      `)
      .eq("id", id)
      .eq("user_id", session.user.id) // Security: Pastikan hanya menghapus milik sendiri
      .single();

    if (cvError || !cvData) {
      return NextResponse.json(
        {
          status: false,
          message: "CV tidak ditemukan atau Anda tidak memiliki akses",
          error: { database: ["Record not found"] },
        },
        { status: 404 }
      );
    }

    // Tipe data manual karena join query
    const asset = cvData.assets as unknown as { id: string; storage_path: string };

    // 3. Delete from Storage
    if (asset?.storage_path) {
      const { error: storageError } = await supabase.storage
        .from("assets")
        .remove([asset.storage_path]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        // Kita lanjutkan saja untuk menghapus record database agar tidak orphan, 
        // atau return error tergantung kebijakan. Di sini kita log saja.
      }
    }

    // 4. Delete from Database
    // Karena ON DELETE CASCADE diatur pada FK, menghapus record di 'assets' 
    // akan otomatis menghapus record di 'candidate_cv'.
    // Jadi kita hapus parent recordnya yaitu 'assets'.
    
    const { error: deleteError } = await supabase
      .from("assets")
      .delete()
      .eq("id", asset.id);

    if (deleteError) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal menghapus data CV",
          error: { database: [deleteError.message] },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: true,
      message: "CV berhasil dihapus",
    });

  } catch (error) {
    console.error("Delete CV error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { 
        status: false, 
        message: "Terjadi kesalahan internal server",
        error: { server: [errorMessage] } 
      },
      { status: 500 }
    );
  }
}
