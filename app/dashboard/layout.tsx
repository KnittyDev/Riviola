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
    .select("role, company_id, full_name, avatar_url, email")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "investor";
  let companyName = "Company";
  let companyLogoUrl: string | null = null;
  if (role === "staff" || role === "admin") {
    if (profile?.company_id) {
      const { data: company } = await supabase
        .from("companies")
        .select("name, logo_url")
        .eq("id", profile.company_id)
        .single();
      if (company?.name) companyName = company.name.trim();
      if (company?.logo_url) companyLogoUrl = company.logo_url;
    }
  }
  const fullName = profile?.full_name?.trim() || (role === "investor" ? "Investor" : "Staff");
  const avatarUrl = profile?.avatar_url?.trim() || null;
  const email = profile?.email?.trim() || user.email?.trim() || null;
  return (
    <DashboardLayoutClient
      role={role}
      companyName={companyName}
      companyLogoUrl={companyLogoUrl}
      fullName={fullName}
      avatarUrl={avatarUrl}
      email={email}
    >
      {children}
    </DashboardLayoutClient>
  );
}
