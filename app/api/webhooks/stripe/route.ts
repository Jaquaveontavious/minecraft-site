import Stripe from "stripe";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { Tier } from "@/lib/database.types";
import { assignRankRole, revokeTruePlus } from "@/lib/discord";
import { grantRank, revokeRank } from "@/lib/rcon";

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

const PRICE_IDS: Record<Exclude<Tier, "free">, string> = {
  basic: "price_1TZGrUK05XOyl34oX2Ua0Ecp",
  true: "price_1TZGshK05XOyl34ouCuXxgaZ",
  true_plus: "price_1TZGtBK05XOyl34osSHPFys4",
};

async function setUserTier(discordId: string, tier: Tier): Promise<string | null> {
  const supabase = createServerClient();

  const { data: updated, error: updateError } = await supabase
    .from("users")
    .update({ tier })
    .eq("discord_id", discordId)
    .select("minecraft_username")
    .maybeSingle();

  if (updateError) {
    console.error(`Failed to set tier ${tier} for ${discordId}:`, updateError.message);
    throw updateError;
  }

  if (updated) {
    console.log(`Set tier=${tier} for discord_id=${discordId}`);
    return updated.minecraft_username ?? null;
  }

  // Fallback: user row missing (shouldn't happen if they logged in before checkout)
  const { data: inserted, error: insertError } = await supabase
    .from("users")
    .insert({
      discord_id: discordId,
      discord_username: `discord_${discordId}`,
      tier,
    })
    .select("minecraft_username")
    .single();

  if (insertError) {
    console.error(`Failed to create user for ${discordId}:`, insertError.message);
    throw insertError;
  }

  console.log(`Created user and set tier=${tier} for discord_id=${discordId}`);
  return inserted.minecraft_username ?? null;
}

async function recordPurchase(
  discordId: string,
  tier: Exclude<Tier, "free">,
  session: Stripe.Checkout.Session
) {
  const supabase = createServerClient();
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("discord_id", discordId)
    .single();

  if (userError || !user) {
    console.error(`Cannot record purchase — user not found for ${discordId}`);
    return;
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (!customerId) {
    console.error("Cannot record purchase — missing Stripe customer id");
    return;
  }

  const { error } = await supabase.from("purchases").insert({
    user_id: user.id,
    tier,
    stripe_customer_id: customerId,
    stripe_price_id: PRICE_IDS[tier],
    status: "active",
  });

  if (error) {
    console.error(`Failed to record purchase for ${discordId}:`, error.message);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tier = session.metadata?.tier;
  const discordId = session.metadata?.discord_id ?? session.client_reference_id;

  if (!tier || !discordId) {
    console.error("Missing tier or discord_id in checkout metadata");
    return;
  }

  const paidTier = tier as Exclude<Tier, "free">;

  const minecraftUsername = await setUserTier(discordId, paidTier);
  await recordPurchase(discordId, paidTier, session);
  await assignRankRole(discordId, tier);
  if (minecraftUsername) {
    await grantRank(minecraftUsername, tier);
  } else {
    console.warn(`No Minecraft username for ${discordId} — skipping RCON rank grant`);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const discordId = subscription.metadata?.discord_id;
  if (!discordId) return;

  const activeStatuses = ["active", "trialing"];
  const isActive = activeStatuses.includes(subscription.status);

  if (isActive) {
    const minecraftUsername = await setUserTier(discordId, "true_plus");
    await assignRankRole(discordId, "true_plus");
    if (minecraftUsername) await grantRank(minecraftUsername, "true_plus");
  } else {
    // Lapsed payment — revert to True (they still own True)
    const minecraftUsername = await setUserTier(discordId, "true");
    await revokeTruePlus(discordId);
    if (minecraftUsername) await revokeRank(minecraftUsername, "true_plus");
    console.log(`Subscription ${subscription.status} — reverted ${discordId} to true`);
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const discordId = subscription.metadata?.discord_id;
  if (!discordId) return;
  // Subscription fully cancelled — drop back to True rank
  const minecraftUsername = await setUserTier(discordId, "true");
  await revokeTruePlus(discordId);
  if (minecraftUsername) await revokeRank(minecraftUsername, "true_plus");
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Stripe will retry and fire subscription.updated with status "past_due",
  // which handleSubscriptionChange already handles.
  console.log(`Payment failed — customer: ${invoice.customer}, invoice: ${invoice.id}`);
}
