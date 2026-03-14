import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const INFOBIP_API_KEY = Deno.env.get("INFOBIP_API_KEY");
const INFOBIP_BASE_URL = Deno.env.get("INFOBIP_BASE_URL") || "https://pdevye.api.infobip.com";

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const now = new Date();
    const currentMonth = now.getUTCMonth() + 1;
    const currentYear = now.getUTCFullYear();
    const period = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const dayOfMonth = now.getUTCDate();

    console.log(`[Overdue SMS] Processing for period: ${period}, Day: ${dayOfMonth}`);

    // 1. Get all buildings with dues settings
    const { data: settings, error: settingsError } = await supabase
      .from("building_dues_settings")
      .select("building_id, payment_window_end_day");

    if (settingsError) throw settingsError;

    const overdueBuildings = settings.filter(s => dayOfMonth > (s.payment_window_end_day ?? 31));
    if (overdueBuildings.length === 0) {
      return new Response(JSON.stringify({ message: "No buildings are past the deadline yet today." }), { status: 200 });
    }

    const buildingIds = overdueBuildings.map(b => b.building_id);

    // 2. Find all unpaid units in these buildings for the current period
    // We look for units that DON'T have a row in dues_payments for this month, OR have one but with overdue_sms_sent_at NULL
    const { data: units, error: unitsError } = await supabase
      .from("investor_properties")
      .select(`
        id,
        profile_id,
        block,
        unit,
        building_id,
        buildings(name),
        profiles(full_name, phone)
      `)
      .in("building_id", buildingIds);

    if (unitsError) throw unitsError;

    // 3. Fetch existing payments for this period to filter out paid ones
    const { data: payments, error: paymentsError } = await supabase
      .from("dues_payments")
      .select("investor_property_id, paid_at, overdue_sms_sent_at")
      .eq("period", period);

    if (paymentsError) throw paymentsError;

    const paymentMap = new Map(payments.map(p => [p.investor_property_id, p]));

    const overdueUnits = units.filter(u => {
      const payment = paymentMap.get(u.id);
      // Not paid AND SMS not sent yet
      return !payment?.paid_at && !payment?.overdue_sms_sent_at;
    });

    console.log(`[Overdue SMS] Found ${overdueUnits.length} unpaid units past deadline.`);

    const results = [];

    for (const unit of overdueUnits) {
      const phone = unit.profiles?.phone;
      const name = unit.profiles?.full_name || "Valued Investor";
      const bName = unit.buildings?.name || "Riviola";

      if (!phone) {
        console.warn(`[Overdue SMS] No phone number for profile ${unit.profile_id}, skipping.`);
        continue;
      }

      // Format phone: Infobip prefers E.164 (e.g. 90542...)
      // Simple clean-up
      const cleanedPhone = phone.replace(/[^0-9]/g, "");

      const message = `Sayın ${name}, ${bName} projemizdeki ${unit.block} Blok, No: ${unit.unit} dairenize ait bu ayki aidat ödemeniz gecikmiştir. Ödemenizi en kısa sürede yapmanızı rica ederiz. Riviola`;

      try {
        const response = await fetch(`${INFOBIP_BASE_URL}/sms/3/messages`, {
          method: "POST",
          headers: {
            "Authorization": `App ${INFOBIP_API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            messages: [{
              destinations: [{ to: cleanedPhone }],
              sender: "447491163443", // Using user's example sender
              content: { text: message }
            }]
          })
        });

        const resultData = await response.json();
        
        if (response.ok) {
          console.log(`[Overdue SMS] Sent to ${cleanedPhone}: ${message}`);
          
          // Update database
          const { error: upsertError } = await supabase
            .from("dues_payments")
            .upsert({
              investor_property_id: unit.id,
              period: period,
              overdue_sms_sent_at: new Date().toISOString()
            }, { onConflict: 'investor_property_id,period' });

          if (upsertError) console.error(`[Overdue SMS] Error updating DB for ${unit.id}:`, upsertError);
          
          results.push({ unitId: unit.id, status: "sent", phone: cleanedPhone });
        } else {
          console.error(`[Overdue SMS] Infobip error for ${cleanedPhone}:`, resultData);
          results.push({ unitId: unit.id, status: "failed", error: resultData });
        }

      } catch (err) {
        console.error(`[Overdue SMS] Request error for ${unit.id}:`, err);
        results.push({ unitId: unit.id, status: "error", error: err.message });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, details: results }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[Overdue SMS] Main error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
