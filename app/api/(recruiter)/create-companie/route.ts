import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

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

export async function POST(request: Request) {
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

    // 2. Ambil & Validasi Body
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
        { status: 400 }
      );
    }

    const companyData = validation.data;

    // 3. Simpan ke Database
    const { data, error } = await supabase
      .from("companies")
      .insert([
        {
          ...companyData,
          website_url:
            companyData.website_url === "" ? null : companyData.website_url, // Ubah string kosong jadi null
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating company:", error.message);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal menyimpan data perusahaan",
          error: { database: [error.message] },
        },
        { status: 400 }
      );
    }

    // 4. Update company_id di profile user (Opsional: jika pembuat otomatis jadi bagian dari perusahaan ini)
    await supabase
      .from("profiles")
      .update({ company_id: data.id })
      .eq("id", session.user.id);

    return NextResponse.json({
      status: true,
      message: "Perusahaan berhasil dibuat",
      data,
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
      { status: 500 }
    );
  }
}
