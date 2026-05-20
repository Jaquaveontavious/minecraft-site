import Stripe from "stripe";
import type { NextRequest } from "next/server";

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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const rank = session.metadata?.rank;
  const minecraftUsername = session.metadata?.minecraft_username;

  console.log(
    `Purchase complete — rank: ${rank}, player: ${minecraftUsername}, customer: ${session.customer}`
  );

  // TODO: grant the rank in-game via your server plugin's API or RCON
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const rank = subscription.metadata?.rank;
  const minecraftUsername = subscription.metadata?.minecraft_username;
  const status = subscription.status;

  console.log(
    `Subscription ${status} — rank: ${rank}, player: ${minecraftUsername}, sub: ${subscription.id}`
  );

  // TODO: update the player's rank based on subscription.status
  // Active statuses: "active", "trialing"
  // Inactive statuses: "past_due", "unpaid", "canceled", "paused"
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const rank = subscription.metadata?.rank;
  const minecraftUsername = subscription.metadata?.minecraft_username;

  console.log(
    `Subscription cancelled — rank: ${rank}, player: ${minecraftUsername}, sub: ${subscription.id}`
  );

  // TODO: remove True+ rank from the player in-game
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(
    `Payment failed — customer: ${invoice.customer}, invoice: ${invoice.id}`
  );

  // TODO: notify the player and/or suspend True+ until payment succeeds
}
