import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StaffAgreementModal } from "@/components/dashboard/staff/StaffAgreementModal";

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
    .select("role, staff_agreement_accepted")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "investor";
  if (role !== "staff" && role !== "admin") {
    redirect("/dashboard");
  }

  // If the staff member hasn't accepted the agreement, show the modal
  if (!profile?.staff_agreement_accepted) {
    return <StaffAgreementModal userId={user.id} />;
  }

  return <>{children}</>;
}
