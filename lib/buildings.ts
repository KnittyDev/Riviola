import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Computes progress (0–100) from planned milestones and current milestone.
 * Progress = (completed count / total) * 100, rounded to integer.
 * "Current" milestone counts as completed (so 1 milestone + current = 100%).
 */
export function computeProgressFromMilestones(
  planned: Array<{ id: string; dateTimeLocal: string }>,
  currentId: string | null
): number {
  if (!planned.length) return 0;
  const sorted = [...planned].sort(
    (a, b) => new Date(a.dateTimeLocal).getTime() - new Date(b.dateTimeLocal).getTime()
  );
  const idx = currentId ? sorted.findIndex((m) => m.id === currentId) : -1;
  const completed = idx < 0 ? 0 : idx + 1;
  return Math.round((completed / sorted.length) * 100);
}

/**
 * Returns the current user's company_id if they are staff or admin; otherwise null.
 * Use in staff dashboard pages to scope building queries.
 */
export async function getStaffCompanyId(
  supabase: SupabaseClient
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();
  if (!profile || (profile.role !== "staff" && profile.role !== "admin"))
    return null;
  return profile.company_id ?? null;
}
