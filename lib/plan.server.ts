import { createClient } from "./supabase/server";
import { PLAN_LIMITS, getPlanFromPlanName } from "./plan";

export async function getCurrentPlan() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_name, status")
    .eq("profile_id", session.user.id)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return getPlanFromPlanName(subscription?.plan_name);
}

export async function getPlanLimits() {
  const plan = await getCurrentPlan();
  if (!plan) return PLAN_LIMITS.essence;
  return PLAN_LIMITS[plan] || PLAN_LIMITS.essence;
}
