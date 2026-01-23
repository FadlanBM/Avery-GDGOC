import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

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
        { status: 401 },
      );
    }

    // 2. Ambil profile user untuk mendapatkan companie_id
    const { data: profile, error: profileError } = await supabase
      .from("hrd_employee_data")
      .select("companie_id")
      .eq("user_id", session.user.id)
      .single();

    if (profileError || !profile?.companie_id) {
      return NextResponse.json(
        {
          status: false,
          message: "User belum terhubung dengan perusahaan manapun",
          error: { database: ["No companie_id found for this user"] },
        },
        { status: 404 },
      );
    }

    // 3. Ambil data perusahaan berdasarkan companie_id tersebut
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", profile.companie_id)
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
        { status: 404 },
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
      { status: 500 },
    );
  }
}

const companySchema = z.object({
  name: z
    .string()
    .min(1, "Nama perusahaan wajib diisi")
    .max(255, "Nama maksimal 255 karakter"),
  industry: z
    .string()
    .max(150, "Industri maksimal 150 karakter")
    .optional()
    .nullable(),
  employee_count: z
    .number()
    .int()
    .nonnegative("Jumlah karyawan tidak boleh negatif")
    .optional()
    .nullable(),
  location: z
    .string()
    .max(255, "Lokasi maksimal 255 karakter")
    .optional()
    .nullable(),
  description: z.string().optional().nullable(),
  website_url: z
    .string()
    .url("Format URL tidak valid")
    .max(512, "URL maksimal 512 karakter")
    .optional()
    .nullable()
    .or(z.literal("")),
});

const companieUpdateSchema = companySchema.partial();

export async function POST(request: Request) {
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
        { status: 401 },
      );
    }

    // 2. Cek apakah user sudah memiliki perusahaan
    const { data: profile, error: profileError } = await supabase
      .from("hrd_employee_data")
      .select("companie_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengambil data profil",
          error: { database: [profileError.message] },
        },
        { status: 400 },
      );
    }

    // Jika profile tidak ditemukan, user belum mengisi biodata
    if (!profile) {
      return NextResponse.json(
        {
          status: false,
          message: "Silakan lengkapi biodata recruiter terlebih dahulu",
          error: { profile: ["Profile not found. Please complete step 1 first."] },
        },
        { status: 404 },
      );
    }

    // Jika sudah punya companie_id, cek apakah perusahaan sudah ada
    if (profile.companie_id) {
      const { data: companyDataFind, error: companyError } = await supabase
        .from("companies")
        .select("id")
        .eq("id", profile.companie_id)
        .maybeSingle();

      if (companyError) {
        console.error("Error checking company:", companyError);
        return NextResponse.json(
          {
            status: false,
            message: "Gagal memvalidasi data perusahaan",
            error: { database: [companyError.message] },
          },
          { status: 400 },
        );
      }

      if (companyDataFind?.id) {
        return NextResponse.json(
          {
            status: false,
            message: "Anda sudah terdaftar dalam sebuah perusahaan",
            error: { auth: ["User already has a company assigned"] },
          },
          { status: 400 },
        );
      }
    }

    // 4. Proses pembuatan perusahaan baru
    const body = await request.json();
    const validation = companySchema.safeParse(body);

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

    const companyData = validation.data;
    const { data: newCompany, error: createError } = await supabase
      .from("companies")
      .insert([
        {
          ...companyData,
          website_url:
            companyData.website_url === "" ? null : companyData.website_url,
        },
      ])
      .select(
        "id, name, industry, employee_count, location, description, website_url",
      )
      .single();

    if (createError) {
      console.error("Error creating company:", createError.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal menyimpan data perusahaan",
          error: { database: [createError.message] },
        },
        { status: 400 },
      );
    }

    // 5. Hubungkan perusahaan baru dengan profil HRD
    const { error: updateError } = await supabase
      .from("hrd_employee_data")
      .update({ companie_id: newCompany.id })
      .eq("user_id", session.user.id);

    if (updateError) {
      console.error("Error updating hrd_employee_data:", updateError.message);
      // Opsional: Hapus perusahaan yang baru dibuat jika gagal menghubungkan?
      // Untuk sekarang kita return error saja
      return NextResponse.json(
        {
          status: false,
          message: "Gagal menghubungkan profil HRD dengan perusahaan",
          error: { database: [updateError.message] },
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Perusahaan berhasil dibuat",
      data: newCompany,
    });
  } catch (err) {
    console.error("Create company error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Terjadi kesalahan internal server";

    return NextResponse.json(
      {
        status: false,
        message: "Internal Server Error",
        error: { server: [errorMessage] },
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
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
        { status: 401 },
      );
    }

    // 2. Ambil profile user untuk mendapatkan companie_id
    const { data: profile, error: profileError } = await supabase
      .from("hrd_employee_data")
      .select("companie_id")
      .eq("user_id", session.user.id)
      .single();

    if (profileError || !profile?.companie_id) {
      return NextResponse.json(
        {
          status: false,
          message: "User belum terhubung dengan perusahaan manapun",
          error: { database: ["No companie_id found for this user"] },
        },
        { status: 404 },
      );
    }

    // 3. Validasi Body dengan Zod
    const body = await request.json();
    const validation = companieUpdateSchema.safeParse(body);

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

    const updateData = validation.data;

    // 4. Update data perusahaan
    const { data, error } = await supabase
      .from("companies")
      .update({
        ...updateData,
      })
      .eq("id", profile.companie_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating company:", error.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal memperbarui data perusahaan",
          error: { database: [error.message] },
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Data perusahaan berhasil diperbarui",
      data,
    });
  } catch (err) {
    console.error("Update job error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Terjadi kesalahan internal server";

    return NextResponse.json(
      {
        status: false,
        message: "Internal Server Error",
        error: { server: [errorMessage] },
      },
      { status: 500 },
    );
  }
}
