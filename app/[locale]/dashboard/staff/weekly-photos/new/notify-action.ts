"use server";

import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";

export async function notifyInvestorsOfNewPhotos(buildingId: string, description: string) {
  const supabase = await createClient();

  // 1. Fetch building details
  const { data: building, error: bError } = await supabase
    .from("buildings")
    .select("name, location")
    .eq("id", buildingId)
    .single();

  if (bError || !building) {
    console.error("Notification cancelled: Building not found", bError);
    return;
  }

  // 2. Resolve all investors linked to this building via investor_properties
  const { data: properties, error: pError } = await supabase
    .from("investor_properties")
    .select(`
      profile_id,
      profiles (
        full_name,
        email
      )
    `)
    .eq("building_id", buildingId);

  if (pError || !properties) {
    console.error("Notification error: Could not fetch investors", pError);
    return;
  }

  // Deduplicate investors (one profile can have multiple units in the same building)
  const uniqueInvestors = new Map<string, { name: string; email: string }>();
  properties.forEach((p: any) => {
    if (p.profiles?.email && !uniqueInvestors.has(p.profiles.email)) {
      uniqueInvestors.set(p.profiles.email, {
        name: p.profiles.full_name || "Valued Investor",
        email: p.profiles.email
      });
    }
  });

  if (uniqueInvestors.size === 0) {
    console.log("No investors found for this building. Skipping notifications.");
    return;
  }

  // 3. Dispatch emails via Resend
  // We send individual professional messages to maintain a high-end feel.
  const emailPromises = Array.from(uniqueInvestors.values()).map(async (investor) => {
    try {
      return await resend.emails.send({
        from: 'Riviola Headquarters <onboarding@resend.dev>',
        to: [investor.email],
        subject: `New Development Update: ${building.name}`,
        html: `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px;">
            <div style="margin-bottom: 32px;">
              <span style="background-color: #134e4a; color: #ffffff; padding: 6px 12px; border-radius: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em;">Official Update</span>
            </div>
            
            <h1 style="font-size: 28px; font-weight: 900; margin-bottom: 8px; color: #111827;">New Visual Progress at ${building.name}</h1>
            <p style="font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 0.1em;">${building.location || 'Construction Site'}</p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
              Hello ${investor.name},<br><br>
              We are pleased to inform you that the field team has just uploaded fresh visual documentation for your project. Our commitment to real-time transparency ensures you are always connected to the growth of your investment.
            </p>
            
            <div style="background-color: #f9fafb; padding: 24px; border-radius: 16px; border: 1px solid #f3f4f6; margin-bottom: 32px;">
              <p style="font-size: 12px; font-weight: 800; color: #134e4a; text-transform: uppercase; margin-bottom: 8px;">Development Note:</p>
              <p style="font-size: 15px; color: #4b5563; font-style: italic; margin: 0;">"${description}"</p>
            </div>
            
            <div style="text-align: center;">
              <a href="https://riviola.com/dashboard" style="display: inline-block; background-color: #134e4a; color: #ffffff; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; transition: 0.2s all;">
                View Progress Dashboard
              </a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 48px 0 24px;">
            <p style="font-size: 11px; text-align: center; color: #9ca3af; line-height: 1.5;">
              This is a secure automated transmission from Riviola Information Systems.<br>
              © 2026 Riviola HQ • Excellence in Asset Modernization.
            </p>
          </div>
        `
      });
    } catch (e) {
      console.error(`Failed to send update email to ${investor.email}:`, e);
      return null;
    }
  });

  // 3. Dispatch emails via Resend as localized background tasks
  // We do NOT await this promise here to prevent blocking the Next.js router transition.
  // The process continues in the background while the staff member is redirected.
  Promise.all(emailPromises).then(() => {
    console.log(`Successfully dispatched ${uniqueInvestors.size} update notifications for Building ID: ${buildingId}`);
  }).catch((err) => {
    console.error("Critical failure during background notification dispatch:", err);
  });

  return { success: true };
}
