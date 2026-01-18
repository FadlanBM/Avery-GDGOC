import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const employeeSchema = z.object({
  fullname: z.string().min(1, "Nama lengkap wajib diisi"),
  gender: z.boolean(),
  dateofbirth: z.string().min(1, "Tanggal lahir wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  position: z.string().min(1, "Posisi/jabatan wajib diisi"),
  is_active: z.boolean().optional(),
});

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
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = employeeSchema.safeParse(body);

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

    const { fullname, gender, dateofbirth, address, position, is_active } =
      validation.data;

    const { data, error } = await supabase
      .from("hrd_employee_data")
      .insert({
        user_id: session.user.id,
        fullname,
        gender,
        dateofbirth,
        address,
        position,
        is_active: typeof is_active === "boolean" ? is_active : true,
        created_at: new Date().toISOString(),
      })
      .select("fullname, gender, dateofbirth, address, position, is_active")
      .single();

    if (error) {
      return NextResponse.json(
        {
          status: false,
          message: "Gagal menyimpan data karyawan HRD",
          error: { database: [error.message] },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: true,
      message: "Data karyawan HRD berhasil dibuat",
      data: { ...data, gender: data.gender ? "Laki-laki" : "Perempuan" },
    });
  } catch (err) {
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
