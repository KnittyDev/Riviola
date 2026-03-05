import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "investor";
  if (role !== "staff" && role !== "admin") {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
