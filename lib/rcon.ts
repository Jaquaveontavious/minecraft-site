import { Rcon } from "rcon-client";

/** LuckPerms group names — override via env if your server uses different names. */
const LP_GROUPS = {
  basic: process.env.LP_GROUP_BASIC ?? "basic",
  true: process.env.LP_GROUP_TRUE ?? "true",
  true_plus: process.env.LP_GROUP_TRUE_PLUS ?? "true_plus",
} as const;

function stripEnv(value: string | undefined): string | undefined {
  return value?.trim().replace(/^["']|["']$/g, "");
}

function parseHostAndPort(rawHost: string, rawPort: string | undefined) {
  let host = rawHost;
  let port = parseInt(rawPort ?? "25575", 10);
  const portExplicitlySet = Boolean(rawPort?.trim());

  if (host.includes("://")) {
    try {
      const url = new URL(host);
      host = url.hostname;
      if (!portExplicitlySet && url.port) port = parseInt(url.port, 10);
    } catch {
      // fall through to host:port parsing
    }
  }

  // host:port in RCON_HOST causes ENOTFOUND if not split (e.g. n-nyc-11.folium.host:25738)
  const lastColon = host.lastIndexOf(":");
  if (lastColon > 0 && /^\d+$/.test(host.slice(lastColon + 1))) {
    if (!portExplicitlySet) port = parseInt(host.slice(lastColon + 1), 10);
    host = host.slice(0, lastColon);
  }

  return { host, port };
}

function getRconConfig() {
  const password = stripEnv(process.env.RCON_PASSWORD);
  if (!password) throw new Error("RCON_PASSWORD is not set");

  const rawHost = stripEnv(process.env.RCON_HOST);
  if (!rawHost) throw new Error("RCON_HOST is not set");

  const { host, port } = parseHostAndPort(rawHost, stripEnv(process.env.RCON_PORT));
  return { host, port, password };
}

function formatRconError(err: unknown, host: string, port: number): Error {
  const detail = err instanceof Error ? err.message : String(err);

  if (detail.includes("ENOTFOUND")) {
    return new Error(
      `Cannot resolve RCON host "${host}" (port ${port}). ` +
        `In Vercel, set RCON_HOST to the hostname only and RCON_PORT separately — ` +
        `e.g. RCON_HOST=n-nyc-11.folium.host and RCON_PORT=25738. ` +
        `You can also try the server IP as RCON_HOST.`
    );
  }

  if (detail.includes("ECONNREFUSED") || detail.includes("ETIMEDOUT")) {
    return new Error(
      `RCON connection to ${host}:${port} failed. ` +
        `Check that RCON is enabled, the port is correct, and Folium allows external RCON connections.`
    );
  }

  return err instanceof Error ? err : new Error(detail);
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
  console.log(`RCON connecting to ${config.host}:${config.port}`);

  const rcon = new Rcon(config);
  try {
    await rcon.connect();
  } catch (err) {
    throw formatRconError(err, config.host, config.port);
  }

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