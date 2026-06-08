import { Rcon } from "rcon-client";

/** LuckPerms group names — override via env if your server uses different names. */
const LP_GROUPS = {
  basic: process.env.LP_GROUP_BASIC ?? "basic",
  true: process.env.LP_GROUP_TRUE ?? "true",
  true_plus: process.env.LP_GROUP_TRUE_PLUS ?? "true_plus",
} as const;

function getRconConfig() {
  const host = process.env.RCON_HOST;
  const password = process.env.RCON_PASSWORD;
  if (!host || !password) throw new Error("RCON_HOST or RCON_PASSWORD is not set");
  return {
    host,
    port: parseInt(process.env.RCON_PORT ?? "25575"),
    password,
  };
}

function normalizeUsername(minecraftUsername: string): string {
  return minecraftUsername.trim().toLowerCase();
}

function assertLuckPermsSuccess(command: string, response: string): void {
  const lower = response.toLowerCase();
  if (
    lower.includes("does not exist") ||
    lower.includes("doesn't exist") ||
    lower.includes("unknown group") ||
    lower.includes("no such group") ||
    lower.includes("error") ||
    lower.includes("invalid")
  ) {
    throw new Error(`LuckPerms rejected "${command}": ${response.trim()}`);
  }
}

async function runCommand(command: string): Promise<string> {
  const config = getRconConfig();
  const rcon = new Rcon(config);
  await rcon.connect();
  try {
    const response = await rcon.send(command);
    console.log(`RCON command: ${command} → ${response}`);
    assertLuckPermsSuccess(command, response);
    return response;
  } finally {
    await rcon.end();
  }
}

async function addGroup(minecraftUsername: string, group: string): Promise<void> {
  const user = normalizeUsername(minecraftUsername);
  await runCommand(`lp user ${user} parent add ${group}`);
}

/**
 * Grant a rank group to a player via LuckPerms.
 * Ranks stack — True+ also gets True and Basic groups.
 */
export async function grantRank(minecraftUsername: string, tier: string) {
  switch (tier) {
    case "basic":
      await addGroup(minecraftUsername, LP_GROUPS.basic);
      break;
    case "true":
      await addGroup(minecraftUsername, LP_GROUPS.basic);
      await addGroup(minecraftUsername, LP_GROUPS.true);
      break;
    case "true_plus":
      await addGroup(minecraftUsername, LP_GROUPS.basic);
      await addGroup(minecraftUsername, LP_GROUPS.true);
      await addGroup(minecraftUsername, LP_GROUPS.true_plus);
      break;
    default:
      console.warn(`grantRank: unknown tier "${tier}"`);
  }
}

/**
 * Remove True+ rank from a player when their subscription lapses.
 * Keeps Basic and True since those are one-time purchases.
 */
export async function revokeRank(minecraftUsername: string, tier: string) {
  const user = normalizeUsername(minecraftUsername);
  const group = LP_GROUPS[tier as keyof typeof LP_GROUPS] ?? tier;
  await runCommand(`lp user ${user} parent remove ${group}`);
}