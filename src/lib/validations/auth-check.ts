import { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export type Role = "registrant" | "recruiter" | "admin";

/**
 * Validates the user's role against a required role or list of roles.
 *
 * @param supabase The Supabase client instance.
 * @param userId The ID of the user to check.
 * @param requiredRole The role or array of roles required to access the resource.
 * @returns An object containing `isValid` (boolean) and optionally a `response` (NextResponse) if invalid.
 */
export async function validateUserRole(
  supabase: SupabaseClient,
  userId: string,
  requiredRole: Role | Role[],
) {
  // 1. Fetch user role from user_roles table
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", userId)
    .maybeSingle();

  const userRole = (roleData?.roles as any)?.name;

  // 2. Normalize requiredRole to an array
  const allowedRoles = Array.isArray(requiredRole)
    ? requiredRole
    : [requiredRole];

  // 3. Check if role is valid
  if (roleError || !userRole || !allowedRoles.includes(userRole)) {
    return {
      isValid: false,
      response: NextResponse.json(
        {
          status: false,
          message: `Forbidden: Akses ditolak. Role anda (${userRole || "unknown"}) tidak diizinkan.`,
          error: { auth: ["Invalid role access"] },
        },
        { status: 403 },
      ),
    };
  }

  return { isValid: true, role: userRole };
}
