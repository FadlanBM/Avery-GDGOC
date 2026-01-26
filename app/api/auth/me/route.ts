import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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

    // Get user role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id)
      .single();

    if (roleError) {
      return NextResponse.json(
        {
          status: false,
          message: "Failed to fetch user role",
          error: { database: [roleError.message] },
        },
        { status: 400 },
      );
    }

    const userRole = roleData?.roles ? (roleData.roles as unknown as { name: string }).name : null;

    // Return user data with role
    return NextResponse.json({
      status: true,
      message: "User data retrieved successfully",
      data: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.display_name || user.user_metadata?.full_name || null,
        avatar: user.user_metadata?.avatar_url || null,
        role: userRole,
      },
    });
  } catch (err) {
    console.error("Error in /api/auth/me:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";

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
