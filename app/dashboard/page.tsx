import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContainer } from "@/modules/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check user role
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .single();

  // If user is a candidate (registrant), redirect to jobs page
  if (userRole?.roles?.name === "registrant") {
    redirect("/jobs");
  }

  return <DashboardContainer user={user} />;
}
