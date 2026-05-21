const DISCORD_API = "https://discord.com/api/v10";
const GUILD_ID = "1504948603012251688";

const ROLE_IDS = {
  basic:     "1505012758180135084",
  true:      "1505012926397022228",
  true_plus: "1505013009767207063",
} as const;

function getBotToken() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN is not set");
  return token;
}

async function addRole(discordId: string, roleId: string) {
  const res = await fetch(
    `${DISCORD_API}/guilds/${GUILD_ID}/members/${discordId}/roles/${roleId}`,
    {
      method: "PUT",
      headers: { Authorization: `Bot ${getBotToken()}` },
    }
  );
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`Discord addRole failed (${res.status}): ${text}`);
  }
}

async function removeRole(discordId: string, roleId: string) {
  const res = await fetch(
    `${DISCORD_API}/guilds/${GUILD_ID}/members/${discordId}/roles/${roleId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bot ${getBotToken()}` },
    }
  );
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`Discord removeRole failed (${res.status}): ${text}`);
  }
}

/**
 * Assign the correct Discord role(s) when a rank is purchased.
 * True includes Basic perks, True+ includes True perks — so we stack the roles.
 */
export async function assignRankRole(discordId: string, tier: string) {
  switch (tier) {
    case "basic":
      await addRole(discordId, ROLE_IDS.basic);
      break;
    case "true":
      await addRole(discordId, ROLE_IDS.basic);
      await addRole(discordId, ROLE_IDS.true);
      break;
    case "true_plus":
      await addRole(discordId, ROLE_IDS.basic);
      await addRole(discordId, ROLE_IDS.true);
      await addRole(discordId, ROLE_IDS.true_plus);
      break;
    default:
      console.warn(`assignRankRole: unknown tier "${tier}"`);
  }
}

/**
 * Remove True+ role when a subscription lapses or is cancelled.
 * Keeps Basic and True since those were one-time purchases.
 */
export async function revokeTruePlus(discordId: string) {
  await removeRole(discordId, ROLE_IDS.true_plus);
}