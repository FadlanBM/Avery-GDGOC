import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { validateUserRole } from "../validations/auth-check";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    // Jika environment variables tidak ada, izinkan akses ke login/register
    if (
      !request.nextUrl.pathname.startsWith("/login") &&
      !request.nextUrl.pathname.startsWith("/register") &&
      !request.nextUrl.pathname.startsWith("/recruiter/login") &&
      !request.nextUrl.pathname.startsWith("/recruiter/register") &&
      !request.nextUrl.pathname.startsWith("/complete-profile") &&
      !request.nextUrl.pathname.startsWith("/recruiter/complete-profile")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user = null;
  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;
  } catch (error) {
    console.error("Error fetching user:", error);
    // Jika error fetch, izinkan akses ke login/register
    if (
      !request.nextUrl.pathname.startsWith("/login") &&
      !request.nextUrl.pathname.startsWith("/register") &&
      !request.nextUrl.pathname.startsWith("/recruiter/login") &&
      !request.nextUrl.pathname.startsWith("/recruiter/register") &&
      !request.nextUrl.pathname.startsWith("/complete-profile") &&
      !request.nextUrl.pathname.startsWith("/recruiter/complete-profile") &&
      !request.nextUrl.pathname.startsWith("/auth/callback")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/register") &&
    !request.nextUrl.pathname.startsWith("/recruiter/login") &&
    !request.nextUrl.pathname.startsWith("/recruiter/register") &&
    !request.nextUrl.pathname.startsWith("/complete-profile") &&
    !request.nextUrl.pathname.startsWith("/recruiter/complete-profile") &&
    !request.nextUrl.pathname.startsWith("/auth/callback") &&
    !request.nextUrl.pathname.startsWith("/api/auth-recruiter/login") &&
    !request.nextUrl.pathname.startsWith("/api/auth-recruiter/register") &&
    !request.nextUrl.pathname.startsWith("/api/auth-candidate/login") &&
    !request.nextUrl.pathname.startsWith("/api/auth-candidate/register") &&
    !request.nextUrl.pathname.startsWith("/api/auth-candidate/google") &&
    !request.nextUrl.pathname.startsWith("/api/auth-recruiter/google") &&
    !request.nextUrl.pathname.startsWith("/api/candidate/job") &&
    !request.nextUrl.pathname.startsWith("/jobs") &&
    !request.nextUrl.pathname.startsWith("/settings") &&
    !request.nextUrl.pathname.startsWith("/my-applications")
  ) {
    // Jika permintaan datang dari API, kembalikan JSON error
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          status: false,
          message: "Unauthorized: Silakan login terlebih dahulu",
          error: { auth: ["Session not found"] },
        },
        { status: 401 },
      );
    }

    // Jika bukan API, lakukan redirect ke halaman login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Check if user is registrant and needs to complete profile
  if (
    user &&
    !request.nextUrl.pathname.startsWith("/complete-profile") &&
    !request.nextUrl.pathname.startsWith("/api/")
  ) {
    try {
      // Check user role
      const roleValidation = await validateUserRole(
        supabase,
        user.id,
        "registrant",
      );

      if (roleValidation.isValid) {
        // Check if candidate profile exists
        const { data: candidateProfile } = await supabase
          .from("candidate")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        // If no profile exists, redirect to complete-profile
        if (
          !candidateProfile &&
          !request.nextUrl.pathname.startsWith("/login") &&
          !request.nextUrl.pathname.startsWith("/register") &&
          !request.nextUrl.pathname.startsWith("/auth/callback")
        ) {
          const url = request.nextUrl.clone();
          url.pathname = "/complete-profile";
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse;
}
