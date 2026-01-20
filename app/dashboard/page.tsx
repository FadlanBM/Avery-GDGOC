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

  return <DashboardContainer user={user} />;
}
