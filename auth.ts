import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { createServerClient } from "@/lib/supabase";

// Extend the built-in session type to expose discordId
declare module "next-auth" {
  interface Session {
    user: {
      discordId: string;
      tier: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

interface DiscordProfile {
  id: string;
  username?: string;
  global_name?: string | null;
  avatar: string | null;
}

function getDiscordUsername(profile: DiscordProfile): string {
  return profile.username || profile.global_name || `discord_${profile.id}`;
}

function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: getAuthSecret(),
  trustHost: true,
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID ?? process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET ?? process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "discord" || !profile) return false;

      const discordProfile = profile as unknown as DiscordProfile;
      const { id, avatar } = discordProfile;
      const username = getDiscordUsername(discordProfile);

      const avatarUrl = avatar
        ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
        : null;

      try {
        const supabase = createServerClient();
        const { error } = await supabase.from("users").upsert(
          {
            discord_id: id,
            discord_username: username,
            discord_avatar: avatarUrl,
          },
          { onConflict: "discord_id" }
        );

        if (error) {
          console.error("Supabase upsert failed:", error.message);
          return false;
        }
      } catch (err) {
        console.error("Supabase client error during sign-in:", err);
        return false;
      }

      return true;
    },

    async jwt({ token, account, profile }) {
      if (account?.provider === "discord" && profile) {
        token.discordId = (profile as unknown as DiscordProfile).id;
      }

      if (token.discordId) {
        try {
          const supabase = createServerClient();
          const { data } = await supabase
            .from("users")
            .select("tier")
            .eq("discord_id", token.discordId as string)
            .maybeSingle();
          token.tier = data?.tier ?? "free";
        } catch (err) {
          console.error("Failed to load tier during jwt callback:", err);
          token.tier = token.tier ?? "free";
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.discordId = token.discordId as string;
      session.user.tier = token.tier as string;
      return session;
    },
  },
});
