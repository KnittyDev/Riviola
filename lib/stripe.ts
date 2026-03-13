import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret && process.env.NODE_ENV === "production") {
  console.warn("[stripe] STRIPE_SECRET_KEY is not set");
}

export const stripe = secret
  ? new Stripe(secret, {
      apiVersion: "2026-02-25.clover" as any,
    })
  : null;

export function getStripe(): Stripe {
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is not configured");
  return stripe;
}
