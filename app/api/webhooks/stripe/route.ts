import Stripe from "stripe";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { Tier } from "@/lib/database.types";
import { assignRankRole, revokeTruePlus } from "@/lib/discord";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("STRIPE_WEBHOOK_SECRET is not set", { status: 500 });
  }

  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error handling event ${event.type}:`, err);
    // Return 500 so Stripe retries the webhook
    return new Response("Internal server error", { status: 500 });
  }

  return new Response(null, { status: 200 });
}

async function setUserTier(discordId: string, tier: Tier) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("users")
    .update({ tier })
    .eq("discord_id", discordId);
  if (error) {
    console.error(`Failed to set tier ${tier} for ${discordId}:`, error.message);
    throw error;
  }
  console.log(`Set tier=${tier} for discord_id=${discordId}`);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tier = session.metadata?.tier;
  const discordId = session.metadata?.discord_id ?? session.client_reference_id;

  if (!tier || !discordId) {
    console.error("Missing tier or discord_id in checkout metadata");
    return;
  }

  // For one-time purchases (basic, true) update immediately.
  // For subscriptions (true_plus) the subscription.created event handles it,
  // but we also update here as a belt-and-suspenders measure.
  await setUserTier(discordId, tier as Tier);
  await assignRankRole(discordId, tier);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const discordId = subscription.metadata?.discord_id;
  if (!discordId) return;

  const activeStatuses = ["active", "trialing"];
  const isActive = activeStatuses.includes(subscription.status);

  if (isActive) {
    await setUserTier(discordId, "true_plus");
    await assignRankRole(discordId, "true_plus");
  } else {
    // Lapsed payment — revert to True (they still own True)
    await setUserTier(discordId, "true");
    await revokeTruePlus(discordId);
    console.log(`Subscription ${subscription.status} — reverted ${discordId} to true`);
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const discordId = subscription.metadata?.discord_id;
  if (!discordId) return;
  // Subscription fully cancelled — drop back to True rank
  await setUserTier(discordId, "true");
  await revokeTruePlus(discordId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Stripe will retry and fire subscription.updated with status "past_due",
  // which handleSubscriptionChange already handles.
  console.log(`Payment failed — customer: ${invoice.customer}, invoice: ${invoice.id}`);
}
