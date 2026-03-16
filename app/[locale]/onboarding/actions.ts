"use server";

import { createClient } from "@/lib/supabase/server";
import { OnboardingSubmissionInsert } from "@/lib/supabase/types";

export async function submitOnboarding(data: OnboardingSubmissionInsert) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("onboarding_submissions")
        .insert([data]);

    if (error) {
        console.error("Error submitting onboarding:", error);
        throw new Error("Failed to submit onboarding data");
    }

    return { success: true };
}
