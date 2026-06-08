import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase";
import type { Tier } from "@/lib/database.types";

const TIER_RANK: Record<Tier, number> = {
  free: 0,
  basic: 1,
  true: 2,
  true_plus: 3,
};

const PAID_TIERS = ["basic", "true", "true_plus"] as const;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

function highestTier(current: Tier, candidate: string | undefined): Tier {
  if (!candidate || !PAID_TIERS.includes(candidate as (typeof PAID_TIERS)[number])) {
    return current;
  }
  const tier = candidate as Tier;
  return TIER_RANK[tier] > TIER_RANK[current] ? tier : current;
}

/**
 * If the DB tier is stale, look up paid Stripe checkout sessions for this Discord ID.
 */
export async function reconcileTierFromStripe(discordId: string): Promise<Tier | null> {
  const stripe = getStripe();
  let best: Tier = "free";
  let startingAfter: string | undefined;

  // Paginate through recent checkout sessions (Stripe retains ~90 days)
  for (let page = 0; page < 10; page++) {
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      starting_after: startingAfter,
    });

    for (const session of sessions.data) {
      const sessionDiscordId =
        session.metadata?.discord_id ?? session.client_reference_id ?? undefined;
      if (sessionDiscordId !== discordId) continue;
      if (session.payment_status !== "paid") continue;
      best = highestTier(best, session.metadata?.tier);
    }

    if (!sessions.has_more || sessions.data.length === 0) break;
    startingAfter = sessions.data[sessions.data.length - 1].id;
  }

  if (best === "free") return null;

  const supabase = createServerClient();
  const { error } = await supabase
    .from("users")
    .update({ tier: best })
    .eq("discord_id", discordId);

  if (error) {
    console.error(`Stripe reconcile failed for ${discordId}:`, error.message);
    return null;
  }

  console.log(`Stripe reconcile set tier=${best} for discord_id=${discordId}`);
  return best;
}
