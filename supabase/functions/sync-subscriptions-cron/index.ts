import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@^14.21.0";

Deno.serve(async (req) => {
  // Optional: Check for a service role key or a custom secret to prevent unauthorized triggers
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY is missing in Edge Function secrets." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("Starting subscription sync...");

    // 1. Fetch all non-canceled subscriptions from our DB
    // We sync trialing, active, past_due, and even unpaid to see if they transition to canceled
    const { data: subs, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .neq("status", "canceled");

    if (fetchError) throw fetchError;

    console.log(`Found ${subs?.length || 0} subscriptions to check.`);

    const results = [];

    for (const sub of (subs || [])) {
      try {
        // 2. Retrieve latest state from Stripe
        const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
        
        // 3. Prepare updates
        const updates = {
          status: stripeSub.status,
          current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: stripeSub.cancel_at_period_end,
          stripe_price_id: stripeSub.items.data[0]?.price.id,
          updated_at: new Date().toISOString(),
        };

        // 4. Update Supabase
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update(updates)
          .eq("id", sub.id);

        if (updateError) throw updateError;
        
        console.log(`Successfully synced subscription: ${sub.id} (Status: ${stripeSub.status})`);
        results.push({ id: sub.id, stripe_id: sub.stripe_subscription_id, status: stripeSub.status, updated: true });
      } catch (err) {
        console.error(`Error syncing subscription ${sub.id}:`, err.message);
        
        // If the subscription is not found in Stripe, mark it as canceled in our DB
        if (err.code === "resource_missing") {
           await supabase
            .from("subscriptions")
            .update({ status: "canceled", updated_at: new Date().toISOString() })
            .eq("id", sub.id);
           results.push({ id: sub.id, status: "canceled", note: "Not found in Stripe", updated: true });
        } else {
           results.push({ id: sub.id, error: err.message, updated: false });
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Synced ${results.filter(r => r.updated).length} subscriptions.`,
      details: results 
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Cron Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
