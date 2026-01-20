import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const completeProfileSchema = z.object({
  fullname: z.string().min(1, "Nama lengkap wajib diisi"),
  gender: z.boolean(),
  dateofbirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Format tanggal lahir tidak valid",
  }),
  last_education: z.string().uuid("ID tingkat pendidikan tidak valid"),
  address: z.string().min(1, "Alamat wajib diisi"),
  phone: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit"),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Get Authentication User
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

    // 2. Validate Role (Must be registrant)
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id)
      .maybeSingle();

    const userRole = (roleData?.roles as any)?.name;

    if (roleError || userRole !== "registrant") {
      return NextResponse.json(
        {
          status: false,
          message:
            "Forbidden: Anda tidak memiliki akses untuk melengkapi data candidate",
          error: { auth: ["Invalid role access"] },
        },
        { status: 403 },
      );
    }

    // 3. Validate Request Body
    const body = await request.json();
    const validation = completeProfileSchema.safeParse(body);

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

    const { fullname, gender, dateofbirth, last_education, address, phone } =
      validation.data;

    // 4. Validate education_level exists
    const { data: educationData, error: educationError } = await supabase
      .from("education_level")
      .select("id")
      .eq("id", last_education)
      .maybeSingle();

    if (educationError) {
      console.error("Education level fetch error:", educationError);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal memvalidasi tingkat pendidikan",
          error: { database: [educationError.message] },
        },
        { status: 500 },
      );
    }

    if (!educationData) {
      return NextResponse.json(
        {
          status: false,
          message: "Tingkat pendidikan tidak ditemukan",
          error: { last_education: ["Education level ID does not exist"] },
        },
        { status: 400 },
      );
    }

    // 5. Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("candidate")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Profil sudah ada. Gunakan API update jika ingin mengubah data.",
          error: { profile: ["Profile already exists"] },
        },
        { status: 400 },
      );
    }

    // 5. Insert to candidate table
    const { error: insertError } = await supabase.from("candidate").insert({
      user_id: user.id,
      fullname,
      gender,
      dateofbirth,
      last_education,
      address,
      phone,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Insert profile error:", insertError);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal menyimpan data profil",
          error: { database: [insertError.message] },
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Data profil berhasil dilengkapi",
      data: {
        user_id: user.id,
        fullname,
        is_active: true,
      },
    });
  } catch (error) {
    console.error("Complete profile error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan internal server";

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
