import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CandidatesContent } from "@/modules/candidates";

export default async function CandidatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <CandidatesContent user={user} />;
}
