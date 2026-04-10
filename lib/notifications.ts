import { createServiceRoleClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";
import { sendSMS } from "@/lib/twilio";

/**
 * Notifies an investor when their request is marked as "Done".
 * Sends both SMS (via Twilio) and Email (via Resend). via sms 
 */
export async function notifyRequestCompleted(requestId: string) {
  const supabase = createServiceRoleClient();

  // 1. Fetch request details including profile and building
  const { data: request, error: rError } = await supabase
    .from("investor_requests")
    .select(`
      id,
      type,
      profile_id,
      building_id,
      profiles (
        full_name,
        email,
        phone
      ),
      buildings (
        name
      )
    `)
    .eq("id", requestId)
    .single();

  if (rError || !request) {
    console.error("[Notifications] Request not found or error:", rError);
    return;
  }

  console.log(`[Notifications] Found request info for ${requestId}. Profile: ${request.profile_id}`);

  const profile = request.profiles as any;
  const building = request.buildings as any;

  if (!profile || !building) {
    console.error("[Notifications] Profile or Building details missing for request:", requestId);
    return;
  }

  console.log(`[Notifications] Target: ${profile.full_name}, Phone: ${profile.phone}, Email: ${profile.email}`);

  // 2. Fetch investor properties/units for this building to include in the message
  const { data: properties } = await supabase
    .from("investor_properties")
    .select("block, unit")
    .eq("profile_id", request.profile_id)
    .eq("building_id", request.building_id);

  const unitsStr = (properties ?? [])
    .map((p) => `${p.block} / ${p.unit}`)
    .join(", ");

  const requestTypeLabel = request.type; // e.g., "Repair request"
  const buildingName = building.name;
  const investorName = profile.full_name || "Valued Investor";

  // 3. Prepare messages
  const smsText = `${buildingName} projesindeki, ${unitsStr} numaralı mülkünüzle ilgili "${requestTypeLabel}" talebiniz tamamlanmıştır. Riviola`;

  console.log(`[Notifications] SMS Message: ${smsText}`);

  const emailSubject = `Talebiniz Tamamlandı: ${requestTypeLabel}`;
  // ... (keeping emailHtml as is)
  const emailHtml = `
    <div style="font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px;">
      <div style="margin-bottom: 32px; text-align: center;">
        <span style="background-color: #134e4a; color: #ffffff; padding: 6px 16px; border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em;">İşlem Tamamlandı</span>
      </div>
      
      <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px; color: #111827; text-align: center;">Sayın ${investorName},</h1>
      
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
        ${buildingName} projesinde bulunan mülkünüz için oluşturduğunuz <strong>"${requestTypeLabel}"</strong> durumundaki talebiniz saha ekibimiz tarafından başarıyla tamamlanmıştır.
      </p>

      <div style="background-color: #f9fafb; padding: 24px; border-radius: 16px; border: 1px solid #f3f4f6; margin-bottom: 32px;">
        <p style="font-size: 12px; font-weight: 800; color: #134e4a; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.05em;">İlgili Bölüm Bilgileri</p>
        <p style="font-size: 15px; color: #111827; margin: 0;"><strong>Proje:</strong> ${buildingName}</p>
        <p style="font-size: 15px; color: #111827; margin: 4px 0 0 0;"><strong>Blok/Daire:</strong> ${unitsStr}</p>
        <p style="font-size: 15px; color: #111827; margin: 4px 0 0 0;"><strong>Talep Türü:</strong> ${requestTypeLabel}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="https://riviola.com/dashboard/requests" style="display: inline-block; background-color: #134e4a; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; transition: 0.2s all;">
          Taleplerimi Görüntüle
        </a>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 40px 0 20px;">
      <p style="font-size: 11px; text-align: center; color: #9ca3af; line-height: 1.5;">
        Bu mesaj Riviola Bilgi Sistemleri tarafından otomatik olarak gönderilmiştir.<br>
        © 2026 Riviola • Excellence in Asset Modernization.
      </p>
    </div>
  `;

  // 4. Send SMS if phone exists
  if (profile.phone) {
    console.log(`[Notifications] Attempting SMS send to ${profile.phone}...`);
    // Normalize phone (ensure it starts with + and has no spaces)
    const phone = profile.phone.replace(/\s+/g, "");
    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    // We don't await SMS here to not block the main process, but we log the result
    sendSMS(formattedPhone, smsText).then((success) => {
      if (success) console.log(`[Notifications] SMS send COMPLETED for ${formattedPhone}`);
      else console.error(`[Notifications] SMS send FAILED for ${formattedPhone}`);
    });
  } else {
    console.log(`[Notifications] Profile has NO phone number. Skipping SMS.`);
  }

  // 5. Send Email if email exists
  if (profile.email) {
    console.log(`[Notifications] Attempting Email send to ${profile.email}...`);
    resend.emails.send({
      from: 'Riviola <onboarding@resend.dev>', // Should be a verified domain in production
      to: [profile.email],
      subject: emailSubject,
      html: emailHtml,
    }).then((res) => {
      if (res.error) console.error("[Notifications] Email FAILED:", res.error);
      else console.log(`[Notifications] Email send COMPLETED for ${profile.email}`);
    }).catch((err) => {
      console.error("[Notifications] Resend error:", err);
    });
  }
}
