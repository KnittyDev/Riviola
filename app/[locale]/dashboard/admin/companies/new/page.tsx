import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewCompanyClient } from "./NewCompanyClient";

export default async function NewCompanyPage() {
  const supabase = await createClient();

  // Role-based access control
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role?.toLowerCase() !== "admin") redirect("/");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <NewCompanyClient />
    </div>
  );
}
