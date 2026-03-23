"use client";

import { createClient as createBrowserClient } from "./supabase/client";
import { PLAN_LIMITS, getPlanFromPlanName } from "./plan";

export async function getCurrentPlanClient() {
  const supabase = createBrowserClient();
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

export async function getPlanLimitsClient() {
  const plan = await getCurrentPlanClient();
  if (!plan) return PLAN_LIMITS.essence;
  return PLAN_LIMITS[plan] || PLAN_LIMITS.essence;
}
