"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleMaintenanceMode(currentState: boolean) {
  const supabase = await createClient();

  // 1. Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role?.toLowerCase() !== "admin") {
    return { error: "Unauthorized" };
  }

  // 2. Fetch the global settings ID for atomic update
  const { data: currentSettings } = await supabase
    .from("site_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!currentSettings) return { error: "Settings record not found" };

  const newState = !currentState;
  const { error } = await supabase
    .from("site_settings")
    .update({ 
      maintenance_mode: newState,
      updated_at: new Date().toISOString()
    })
    .eq("id", currentSettings.id);

  if (error) {
    console.error("Maintenance toggle error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, newState };
}
