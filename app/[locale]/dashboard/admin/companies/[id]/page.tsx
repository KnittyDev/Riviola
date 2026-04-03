import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { CompanyDetailClient } from "./CompanyDetailClient";

export default async function CompanyDetailPage({
  params
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const supabase = await createClient();

  // 1. Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role?.toLowerCase() !== "admin") redirect("/");

  // 2. Fetch company data
  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !company) return notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <CompanyDetailClient company={company} locale={locale} />
    </div>
  );
}
