import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CandidatesContainer } from "@/modules/candidates";

export default async function CandidatesPage() {
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

  return <CandidatesContainer user={user} />;
}
