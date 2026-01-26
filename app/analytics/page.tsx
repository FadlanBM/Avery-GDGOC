import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsContainer } from "@/modules/analytics";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check user role - only allow recruiters
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .single();

  // If user is a candidate (registrant), redirect to jobs page
  if (userRole?.roles?.name === "registrant") {
    redirect("/jobs");
  }

  return <AnalyticsContainer user={user} />;
}
