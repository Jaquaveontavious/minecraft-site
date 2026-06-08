import { auth } from "@/auth";
import { createServerClient } from "@/lib/supabase";
import { grantRank } from "@/lib/rcon";

const PAID_TIERS = ["basic", "true", "true_plus"];

export async function POST() {
  const session = await auth();
  if (!session?.user?.discordId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServerClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("tier, minecraft_username")
    .eq("discord_id", session.user.discordId)
    .single();

  if (error) {
    console.error("Failed to fetch user for rank sync:", error.message);
    return new Response("Database error", { status: 500 });
  }

  if (!user?.tier || !PAID_TIERS.includes(user.tier)) {
    return Response.json({ error: "No paid rank to sync" }, { status: 400 });
  }

  if (!user.minecraft_username) {
    return Response.json(
      { error: "Set your Minecraft username first" },
      { status: 400 }
    );
  }

  try {
    await grantRank(user.minecraft_username, user.tier);
    return Response.json({ ok: true, tier: user.tier });
  } catch (err) {
    const message = err instanceof Error ? err.message : "RCON failed";
    console.error("Manual rank sync failed:", message);
    return Response.json({ error: message }, { status: 502 });
  }
}
