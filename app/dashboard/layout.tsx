import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayoutClient } from "./DashboardLayoutClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id, full_name")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "investor";
  if (role !== "staff" && role !== "admin") {
    await supabase.auth.signOut();
    redirect("/login");
  }
  let companyName = "Company";
  let companyLogoUrl: string | null = null;
  if (profile?.company_id) {
    const { data: company } = await supabase
      .from("companies")
      .select("name, logo_url")
      .eq("id", profile.company_id)
      .single();
    if (company?.name) companyName = company.name.trim();
    if (company?.logo_url) companyLogoUrl = company.logo_url;
  }
  const fullName = profile?.full_name?.trim() || "Staff";
  return (
    <DashboardLayoutClient companyName={companyName} companyLogoUrl={companyLogoUrl} fullName={fullName}>
      {children}
    </DashboardLayoutClient>
  );
}
