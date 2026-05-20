import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import type { Tier, PurchaseStatus } from "@/lib/database.types";

const TIER_META: Record<Tier, { label: string; color: string; bg: string; border: string; price: string }> = {
  free:      { label: "Free",   color: "text-zinc-400",   bg: "bg-zinc-900",    border: "border-zinc-700",    price: "" },
  basic:     { label: "Basic",  color: "text-amber-300",  bg: "bg-[#0f0c05]",   border: "border-amber-900/50", price: "$5.99 one-time" },
  true:      { label: "True",   color: "text-emerald-300",bg: "bg-[#05100a]",   border: "border-emerald-700/60", price: "$15.99 one-time" },
  true_plus: { label: "True+",  color: "text-violet-300", bg: "bg-[#0a0512]",   border: "border-violet-800/50", price: "$9.99/mo" },
};

const STATUS_META: Record<PurchaseStatus, { label: string; color: string }> = {
  active:   { label: "Active",    color: "text-green-400" },
  trialing: { label: "Trialing",  color: "text-blue-400" },
  past_due: { label: "Past Due",  color: "text-yellow-400" },
  unpaid:   { label: "Unpaid",    color: "text-red-400" },
  canceled: { label: "Canceled",  color: "text-zinc-500" },
  paused:   { label: "Paused",    color: "text-zinc-400" },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.discordId) redirect("/");

  const supabase = createServerClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("discord_id", session.user.discordId)
    .single();

  const { data: purchases } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  const tier: Tier = user?.tier ?? "free";
  const tierMeta = TIER_META[tier];

  return (
    <div className="min-h-screen bg-[#080d08]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        {/* ── Profile card ── */}
        <div className="flex items-center gap-5 mb-10">
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? "avatar"}
              className="w-16 h-16 rounded-full border-2 border-[#2d4a2d]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-900 flex items-center justify-center text-2xl font-bold text-green-300">
              {session.user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{session.user.name}</h1>
            <p className="text-zinc-500 text-sm">
              Member since {user ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>

        {/* ── Current rank ── */}
        <section className="mb-8">
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">Current Rank</h2>
          <div className={`rounded-lg border ${tierMeta.border} ${tierMeta.bg} p-5 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-black ${tierMeta.color}`}>{tierMeta.label}</span>
              {tierMeta.price && (
                <span className="text-xs text-zinc-500">{tierMeta.price}</span>
              )}
            </div>
            {tier === "free" && (
              <a
                href="/#ranks"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded transition-colors"
              >
                Upgrade
              </a>
            )}
          </div>
        </section>

        {/* ── Purchase history ── */}
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">Purchase History</h2>
          <div className="rounded-lg border border-[#1a3a1a] bg-[#0b120b] overflow-hidden">
            {!purchases || purchases.length === 0 ? (
              <div className="px-6 py-10 text-center text-zinc-600 text-sm">
                No purchases yet.{" "}
                <a href="/#ranks" className="text-emerald-600 hover:text-emerald-400 transition-colors">
                  View ranks →
                </a>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1a3a1a] text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Rank</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => {
                    const t = TIER_META[p.tier];
                    const s = STATUS_META[p.status];
                    return (
                      <tr key={p.id} className="border-b border-[#111d11] last:border-0">
                        <td className={`px-5 py-4 font-semibold ${t.color}`}>{t.label}</td>
                        <td className={`px-5 py-4 ${s.color}`}>{s.label}</td>
                        <td className="px-5 py-4 text-zinc-500">
                          {new Date(p.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}