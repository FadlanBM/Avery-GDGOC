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

  return <AnalyticsContainer user={user} />;
}
