import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${next}&role=recruiter`,
    },
  });

  if (error) {
    console.error("OAuth error:", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  if (data?.url) {
    // Redirect langsung ke Google
    return NextResponse.redirect(data.url);
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could not initiate OAuth`,
  );
}
