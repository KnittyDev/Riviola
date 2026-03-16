import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Only buyers can access Financials; renters are redirected to dashboard. */
export default async function FinancialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, investor_type")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "investor";
  if (role === "investor" && profile?.investor_type === "renter") {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
