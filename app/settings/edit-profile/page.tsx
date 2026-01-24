import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditProfileContainer } from "@/modules/settings";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <EditProfileContainer user={user} />;
}
