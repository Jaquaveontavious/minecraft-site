import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { createServerClient } from "@/lib/supabase";

// Extend the built-in session type to expose discordId
declare module "next-auth" {
  interface Session {
    user: {
      discordId: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

interface DiscordProfile {
  id: string;
  username: string;
  avatar: string | null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "discord" || !profile) return false;

      const { id, username, avatar } = profile as unknown as DiscordProfile;

      const avatarUrl = avatar
        ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
        : null;

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

      return true;
    },

    // Persist discordId into the JWT on first sign-in
    async jwt({ token, account, profile }) {
      if (account?.provider === "discord" && profile) {
        token.discordId = (profile as unknown as DiscordProfile).id;
      }
      return token;
    },

    // Expose discordId on the client-accessible session object
    async session({ session, token }) {
      session.user.discordId = token.discordId as string;
      return session;
    },
  },
});
