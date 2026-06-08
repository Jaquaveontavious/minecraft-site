import { auth } from "@/auth";
import { createServerClient } from "@/lib/supabase";
import { grantRank } from "@/lib/rcon";
import type { NextRequest } from "next/server";

const PAID_TIERS = ["basic", "true", "true_plus"];

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.discordId) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { minecraft_username?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const username = body.minecraft_username?.trim();
  if (!username) {
    return new Response("minecraft_username is required", { status: 400 });
  }

  // Basic validation — Minecraft usernames are 3-16 chars, alphanumeric + underscore
  if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
    return new Response("Invalid Minecraft username", { status: 400 });
  }

  const supabase = createServerClient();

  // Fetch current tier before updating so we know whether to grant rank
  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("tier")
    .eq("discord_id", session.user.discordId)
    .single();

  if (fetchError) {
    console.error("Failed to fetch user tier:", fetchError.message);
    return new Response("Database error", { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ minecraft_username: username })
    .eq("discord_id", session.user.discordId);

  if (updateError) {
    console.error("Failed to update minecraft_username:", updateError.message);
    return new Response("Database error", { status: 500 });
  }

  let rankSynced = false;
  let rankSyncError: string | null = null;

  // If the user already has a paid rank, grant it in-game now that we have their username
  if (user?.tier && PAID_TIERS.includes(user.tier)) {
    try {
      await grantRank(username, user.tier);
      rankSynced = true;
    } catch (err) {
      rankSyncError = err instanceof Error ? err.message : "RCON failed";
      console.error("RCON grant failed after username set:", rankSyncError);
    }
  }

  return Response.json({
    minecraft_username: username,
    rank_synced: rankSynced,
    rank_sync_error: rankSyncError,
  });
}