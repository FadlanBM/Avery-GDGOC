import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
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
        { status: 401 },
      );
    }

    // Check if user_id is provided (for HRD viewing candidate's CV)
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("user_id");
    
    // Use target user_id if provided (HRD viewing candidate), otherwise use current user
    const userId = targetUserId || session.user.id;

    // 2. Fetch all CVs for target user with assets data
    const { data: cvs, error } = await supabase
      .from("candidate_cv")
      .select(`
        id,
        asset_id,
        is_primary,
        created_at,
        assets (
          file_name,
          public_url,
          file_size
        )
      `)
      .eq("user_id", userId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil data CV",
          error: { database: [error.message] },
        },
        { status: 500 },
      );
    }

    // Transform data to include file_name and file_url at top level
    const transformedCvs = (cvs || []).map((cv: any) => ({
      id: cv.id,
      asset_id: cv.asset_id,
      is_primary: cv.is_primary,
      created_at: cv.created_at,
      file_name: cv.assets?.file_name || "Unknown",
      file_url: cv.assets?.public_url || "",
      file_size: cv.assets?.file_size || 0,
    }));

    return NextResponse.json({
      status: true,
      message: "Data CV berhasil diambil",
      data: transformedCvs,
    });
  } catch (error) {
    console.error("Get CV error:", error);
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

export async function POST(request: Request) {
  try {
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
        { status: 401 },
      );
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { status: false, message: "File wajib diunggah" },
        { status: 400 },
      );
    }

    // 3. Validate File (PDF only, max 5MB)
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { status: false, message: "Format file harus PDF" },
        { status: 400 },
      );
    }

    // Max 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { status: false, message: "Ukuran file maksimal 5MB" },
        { status: 400 },
      );
    }

    // 4. Upload to Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
    const filePath = `cv/${fileName}`;

    // Pastikan bucket "assets" sudah dibuat di Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengunggah file ke storage",
          error: { storage: [uploadError.message] },
        },
        { status: 500 },
      );
    }

    // 5. Get Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("assets").getPublicUrl(filePath);

    // 6. Insert into assets table
    const assetId = crypto.randomUUID();
    const currentTime = new Date().toISOString();

    const { error: assetError } = await supabase.from("assets").insert({
      id: assetId,
      file_name: file.name,
      storage_path: filePath,
      public_url: publicUrl,
      file_size: file.size,
      mime_type: file.type,
      created_at: currentTime,
      updated_at: currentTime,
    });

    if (assetError) {
      // Cleanup storage if db insert fails
      await supabase.storage.from("assets").remove([filePath]);

      return NextResponse.json(
        {
          status: false,
          message: "Gagal menyimpan metadata asset",
          error: { database: [assetError.message] },
        },
        { status: 500 },
      );
    }

    // 7. Insert into candidate_cv table
    // Jika is_primary true, hapus CV lama yang primary (GANTIKAN)
    const { data: oldPrimary } = await supabase
      .from("candidate_cv")
      .select("asset_id, assets!inner(storage_path)")
      .eq("user_id", session.user.id)
      .eq("is_primary", true)
      .maybeSingle();

    if (oldPrimary) {
      // Hapus file fisik lama
      const oldAssetPath = (oldPrimary.assets as any).storage_path;
      if (oldAssetPath) {
        await supabase.storage.from("assets").remove([oldAssetPath]);
      }

      // Hapus record asset lama (akan otomatis menghapus data di candidate_cv karena CASCADE)
      await supabase.from("assets").delete().eq("id", oldPrimary.asset_id);
    }

    const cvId = crypto.randomUUID();
    const { error: cvError } = await supabase.from("candidate_cv").insert({
      id: cvId,
      user_id: session.user.id,
      asset_id: assetId,
      is_primary: true,
      created_at: currentTime,
      updated_at: currentTime,
    });

    if (cvError) {
      // Rollback asset and storage
      await supabase.from("assets").delete().eq("id", assetId);
      await supabase.storage.from("assets").remove([filePath]);

      return NextResponse.json(
        {
          status: false,
          message: "Gagal menghubungkan CV dengan kandidat",
          error: { database: [cvError.message] },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "CV berhasil diunggah",
      data: {
        cv_id: cvId,
        public_url: publicUrl,
      },
    });
  } catch (error) {
    console.error("Upload CV error:", error);
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
