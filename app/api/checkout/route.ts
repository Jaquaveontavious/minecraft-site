import { auth } from "@/auth";
import { createServerClient } from "@/lib/supabase";
import Stripe from "stripe";
import type { NextRequest } from "next/server";

const PRICES = {
  basic:     "price_1TZGrUK05XOyl34oX2Ua0Ecp",
  true:      "price_1TZGshK05XOyl34ouCuXxgaZ",
  true_plus: "price_1TZGtBK05XOyl34osSHPFys4",
} as const;

type PurchaseTier = keyof typeof PRICES;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.discordId) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { tier?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const tier = body.tier as PurchaseTier;
  if (!PRICES[tier]) {
    return new Response("Invalid tier", { status: 400 });
  }

  // True+ requires True rank first
  if (tier === "true_plus" && session.user.tier !== "true") {
    return new Response("True+ requires True rank", { status: 403 });
  }

  const supabase = createServerClient();
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("minecraft_username")
    .eq("discord_id", session.user.discordId)
    .single();

  if (userError) {
    console.error("Failed to fetch user for checkout:", userError.message);
    return new Response("Database error", { status: 500 });
  }

  if (!user?.minecraft_username?.trim()) {
    return new Response(
      "Set your Minecraft username on the dashboard before purchasing",
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const baseUrl = process.env.AUTH_URL ?? "https://www.trulysurvival.com";
  const isSubscription = tier === "true_plus";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    line_items: [{ price: PRICES[tier], quantity: 1 }],
    success_url: `${baseUrl}/dashboard?success=true`,
    cancel_url:  `${baseUrl}/#ranks`,
    client_reference_id: session.user.discordId,
    metadata: { discord_id: session.user.discordId, tier },
    // Carry metadata onto the subscription object so the webhook can read it
    ...(isSubscription && {
      subscription_data: {
        metadata: { discord_id: session.user.discordId, tier },
      },
    }),
  });

  return Response.json({ url: checkoutSession.url });
}