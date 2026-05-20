import { Navbar } from "@/components/Navbar";

const SERVER_IP = "play.trulysurvival.net";
const DISCORD_URL = "https://discord.gg/w38F5Nfj";

function Divider({ color }: { color: string }) {
  return (
    <div className={`flex items-center gap-3 my-4`}>
      <div className={`flex-1 h-px ${color}`} />
      <span className="text-base opacity-40">⟡</span>
      <div className={`flex-1 h-px ${color}`} />
    </div>
  );
}

function FeatureGroup({
  icon,
  label,
  items,
  accent,
}: {
  icon: string;
  label: string;
  items: string[];
  accent: string;
}) {
  return (
    <div>
      <div className={`flex items-center gap-2 ${accent} font-semibold text-sm mb-2`}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <ul className="space-y-1 pl-6">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-zinc-400 text-sm">
            <span className={`${accent} opacity-60 mt-0.5 shrink-0`}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Minecraft pixel-art style icons ──────────────────────────

function SwordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" style={{ imageRendering: "pixelated" }}>
      {/* tip */}
      <rect x="1" y="0" width="2" height="2" />
      {/* blade */}
      <rect x="2" y="2" width="2" height="2" />
      <rect x="3" y="4" width="2" height="2" />
      <rect x="4" y="6" width="2" height="2" />
      {/* crossguard */}
      <rect x="1" y="7" width="8" height="2" />
      {/* handle */}
      <rect x="7" y="9" width="2" height="2" />
      <rect x="8" y="11" width="2" height="2" />
      {/* pommel */}
      <rect x="9" y="13" width="3" height="3" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" style={{ imageRendering: "pixelated" }}>
      {/* spine */}
      <rect x="6" y="0" width="2" height="16" />
      {/* left page */}
      <rect x="1" y="1" width="5" height="14" />
      {/* right page */}
      <rect x="8" y="1" width="5" height="14" />
      {/* lines on left page */}
      <rect x="2" y="4" width="3" height="1" fill="currentColor" opacity="0.4" />
      <rect x="2" y="6" width="3" height="1" fill="currentColor" opacity="0.4" />
      <rect x="2" y="8" width="3" height="1" fill="currentColor" opacity="0.4" />
      <rect x="2" y="10" width="2" height="1" fill="currentColor" opacity="0.4" />
      {/* lines on right page */}
      <rect x="9" y="4" width="3" height="1" fill="currentColor" opacity="0.4" />
      <rect x="9" y="6" width="3" height="1" fill="currentColor" opacity="0.4" />
      <rect x="9" y="8" width="3" height="1" fill="currentColor" opacity="0.4" />
      <rect x="9" y="10" width="2" height="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" style={{ imageRendering: "pixelated" }}>
      {/* top-left corner */}
      <rect x="2" y="0" width="5" height="2" />
      <rect x="0" y="2" width="2" height="4" />
      {/* top-right corner */}
      <rect x="9" y="0" width="5" height="2" />
      <rect x="14" y="2" width="2" height="4" />
      {/* body */}
      <rect x="0" y="6" width="16" height="4" />
      {/* taper */}
      <rect x="1" y="10" width="14" height="2" />
      <rect x="3" y="12" width="10" height="2" />
      <rect x="6" y="14" width="4" height="2" />
      {/* center stripe */}
      <rect x="7" y="2" width="2" height="8" opacity="0.35" />
    </svg>
  );
}

function BarrierIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" style={{ imageRendering: "pixelated" }}>
      {/* outer ring */}
      <rect x="4" y="0" width="8" height="2" />
      <rect x="0" y="4" width="2" height="8" />
      <rect x="14" y="4" width="2" height="8" />
      <rect x="4" y="14" width="8" height="2" />
      <rect x="2" y="2" width="2" height="2" />
      <rect x="12" y="2" width="2" height="2" />
      <rect x="2" y="12" width="2" height="2" />
      <rect x="12" y="12" width="2" height="2" />
      {/* X */}
      <rect x="4" y="4" width="2" height="2" />
      <rect x="6" y="6" width="2" height="2" />
      <rect x="8" y="8" width="2" height="2" />
      <rect x="10" y="10" width="2" height="2" />
      <rect x="10" y="4" width="2" height="2" />
      <rect x="8" y="6" width="2" height="2" />
      <rect x="6" y="8" width="2" height="2" />
      <rect x="4" y="10" width="2" height="2" />
    </svg>
  );
}

// InfoCard is inlined per-card below to ensure Tailwind picks up all classes

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080d08]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_rgba(74,222,128,0.07)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,_rgba(16,185,129,0.04)_0%,_transparent_60%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-7 max-w-4xl">
          {/* Online badge */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0f1f0f] border border-[#2d4a2d] text-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-green-400 font-mono font-medium">Server Online</span>
            <span className="text-[#2d4a2d] select-none">|</span>
            <span className="text-zinc-400">
              🌿 <span className="text-white font-semibold">Truly Survival</span>
            </span>
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-white leading-none">
            Truly
            <br />
            <span className="text-green-400">Survival</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
            Community driven Vanilla Minecraft, done right.
          </p>

          <div className="flex flex-col items-center gap-3">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-10 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-base uppercase tracking-widest transition-all duration-200 shadow-[0_0_30px_rgba(88,101,242,0.4)] hover:shadow-[0_0_60px_rgba(88,101,242,0.6)]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Join the Discord
            </a>
            <div className="flex items-center gap-2 text-zinc-500 text-sm font-mono">
              <span>IP:</span>
              <code className="text-zinc-300">{SERVER_IP}</code>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 flex flex-col items-center gap-1 text-zinc-600 animate-bounce">
          <span className="text-xs uppercase tracking-widest font-mono">Scroll</span>
          <span>↓</span>
        </div>
      </section>

      {/* ── Ranks ── */}
      <section id="ranks" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-3">Support the Server</h2>
            <p className="text-zinc-400 text-lg">
              Unlock perks and help keep Truly Survival running.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* ── Basic ── */}
            <div className="rounded-lg border border-amber-900/50 bg-[#0f0c05] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-amber-900/30 bg-gradient-to-br from-amber-950/50 to-transparent">
                <div className="text-amber-500/70 text-xs font-mono uppercase tracking-widest mb-1">
                  Tier I
                </div>
                <div className="text-2xl font-bold text-amber-300">Basic</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$5.99</span>
                  <span className="text-zinc-500 text-sm">one-time</span>
                </div>
                <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
                  Starter quality-of-life perks for everyday survival.
                </p>
              </div>

              <div className="p-6 flex flex-col gap-5 flex-1">
                <Divider color="bg-amber-900/30" />
                <FeatureGroup
                  icon="🏠"
                  label="Homes"
                  accent="text-amber-400"
                  items={["+1 Extra Home (2 total)"]}
                />
                <FeatureGroup
                  icon="📦"
                  label="Quality of Life"
                  accent="text-amber-400"
                  items={[
                    "/craft",
                    "/stonecutter",
                    "/smithingtable",
                    "/trash",
                    "and similar utility commands",
                  ]}
                />
                <FeatureGroup
                  icon="🎨"
                  label="Customization"
                  accent="text-amber-400"
                  items={["Head Database access", "Armor Stand statue editor"]}
                />
                <Divider color="bg-amber-900/30" />
              </div>

              <div className="p-6 pt-0">
                <a
                  href="#"
                  className="block w-full text-center py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm uppercase tracking-widest transition-colors"
                >
                  Purchase Basic
                </a>
              </div>
            </div>

            {/* ── True ── */}
            <div className="rounded-lg border border-emerald-700/60 bg-[#05100a] overflow-hidden flex flex-col relative shadow-[0_0_40px_rgba(52,211,153,0.08)]">
              <div className="absolute top-0 right-0 bg-emerald-500 text-black text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-bl">
                Popular
              </div>

              <div className="p-6 border-b border-emerald-800/30 bg-gradient-to-br from-emerald-950/50 to-transparent">
                <div className="text-emerald-500/70 text-xs font-mono uppercase tracking-widest mb-1">
                  Tier II
                </div>
                <div className="text-2xl font-bold text-emerald-300">True</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$15.99</span>
                  <span className="text-zinc-500 text-sm">one-time</span>
                </div>
                <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
                  Expanded utility, convenience, and team features.
                </p>
              </div>

              <div className="p-6 flex flex-col gap-5 flex-1">
                <Divider color="bg-emerald-900/30" />
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-emerald-950/60 border border-emerald-900/40">
                  <span className="text-emerald-400">✨</span>
                  <span className="text-emerald-300 text-sm font-medium">
                    Includes ALL perks from Basic
                  </span>
                </div>
                <FeatureGroup
                  icon="🏠"
                  label="Homes"
                  accent="text-emerald-400"
                  items={["+2 Extra Homes (3 total)"]}
                />
                <FeatureGroup
                  icon="📦"
                  label="Quality of Life"
                  accent="text-emerald-400"
                  items={["/ec (Ender Chest access)", "/anvil"]}
                />
                <FeatureGroup
                  icon="⚔"
                  label="Gameplay Perks"
                  accent="text-emerald-400"
                  items={["Bigger team caps", "Ability to create custom duel kits"]}
                />
                <Divider color="bg-emerald-900/30" />
              </div>

              <div className="p-6 pt-0">
                <a
                  href="#"
                  className="block w-full text-center py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(52,211,153,0.25)] hover:shadow-[0_0_35px_rgba(52,211,153,0.45)]"
                >
                  Purchase True
                </a>
              </div>
            </div>

            {/* ── True+ ── */}
            <div className="relative rounded-lg border-2 border-violet-400 bg-[#0a0512] overflow-hidden flex flex-col shadow-[0_0_70px_rgba(167,139,250,0.35),inset_0_0_50px_rgba(167,139,250,0.05)]">
              <div className="absolute top-0 right-0 bg-violet-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-bl">
                Exclusive
              </div>
              <div className="p-6 border-b border-violet-700/30 bg-gradient-to-br from-violet-950/60 to-transparent">
                <div className="text-violet-400/80 text-xs font-mono uppercase tracking-widest mb-1">
                  Tier III
                </div>
                <div className="text-2xl font-bold text-violet-200">True+</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$9.99</span>
                  <span className="text-zinc-500 text-sm">/month</span>
                </div>
                <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
                  Farther expanded convenience and cosmetics.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-violet-400/80 bg-violet-950/50 border border-violet-900/30 rounded px-2 py-1 w-fit">
                  <span>⚠</span>
                  <span>Requires True rank first</span>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-5 flex-1">
                <Divider color="bg-violet-900/30" />
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-violet-950/60 border border-violet-900/40">
                  <span className="text-violet-400">✨</span>
                  <span className="text-violet-300 text-sm font-medium">
                    Includes ALL perks from True
                  </span>
                </div>
                <FeatureGroup
                  icon="🏠"
                  label="Homes"
                  accent="text-violet-400"
                  items={["+2 Extra Homes (5 total)"]}
                />
                <FeatureGroup
                  icon="📦"
                  label="Quality of Life"
                  accent="text-violet-400"
                  items={[
                    "Double-sized Ender Chest",
                    "No teleport cooldown",
                    "Teleport time cut in half",
                  ]}
                />
                <FeatureGroup
                  icon="🎨"
                  label="Customization"
                  accent="text-violet-400"
                  items={[
                    "Trails",
                    "Particle editor",
                    "Particle effects",
                    "Custom Join messages",
                    "Custom Leave messages",
                    "Custom Death messages",
                  ]}
                />
                <Divider color="bg-violet-900/30" />
              </div>

              <div className="p-6 pt-0">
                <a
                  href="#"
                  className="block w-full text-center py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm uppercase tracking-widest transition-colors"
                >
                  Purchase True+
                </a>
                <p className="text-center text-xs text-zinc-600 mt-2">
                  Must already own True rank
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About / Info ── */}
      <section
        id="about"
        className="py-24 px-4 border-t border-[#1a2e1a]"
      >
        <div className="max-w-5xl mx-auto">
          {/* Intro */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-3xl">🧍</span>
              <h2 className="text-4xl font-bold text-white">Truly Survival</h2>
              <span className="text-3xl">🧍</span>
            </div>
            <p className="text-green-400 text-lg font-medium mb-6">
              Community driven Vanilla Minecraft, done right.
            </p>
            <p className="text-zinc-400 leading-relaxed max-w-3xl mx-auto text-base">
              Truly Survival is an almost purely vanilla SMP with some small quality-of-life
              additions to improve the experience of players looking to build, trade, explore, PvP,
              or just make new friends and enjoy the community. The server's primary aim is to strike
              a fair balance between all playstyles and preferences within Minecraft to build an
              inclusive environment no matter how you like to play the game.
            </p>
          </div>

          {/* Info cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            {/* ── Events ── amber/gold ── */}
            <div className="rounded-xl border-2 border-amber-500 bg-[#1a1100] shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col">
              <div className="bg-amber-900/50 px-6 py-5 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-amber-800/80 ring-2 ring-amber-400/60 shrink-0">
                  <SwordIcon className="w-8 h-8 text-amber-300" />
                </div>
                <h3 className="text-xl font-bold text-amber-300">Frequent Events</h3>
              </div>
              <div className="h-px bg-amber-600/40" />
              <div className="px-6 py-5 text-zinc-300 text-sm leading-relaxed">
                <p>
                  Whether it be PvP, parkour, build competitions, or any minigame the community
                  wants, it&apos;s happening. Consistent events are something players on Truly
                  Survival can look forward to participating in.
                </p>
              </div>
            </div>

            {/* ── Gameplay Info ── sky blue ── */}
            <div className="rounded-xl border-2 border-sky-500 bg-[#00111a] shadow-[0_0_50px_rgba(14,165,233,0.25)] overflow-hidden flex flex-col">
              <div className="bg-sky-900/50 px-6 py-5 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-sky-800/80 ring-2 ring-sky-400/60 shrink-0">
                  <BookIcon className="w-8 h-8 text-sky-300" />
                </div>
                <h3 className="text-xl font-bold text-sky-300">Gameplay Info</h3>
              </div>
              <div className="h-px bg-sky-600/40" />
              <div className="px-6 py-5 text-zinc-300 text-sm leading-relaxed">
                <ul className="space-y-2">
                  {[
                    "Mostly Vanilla gameplay with slight QOL tweaks",
                    "/tpa and /sethome for traveling long distances, with a cooldown",
                    "/teams for groups trying to work together",
                    "Smaller world border (50k–200k) to encourage player interaction",
                    "No whitelist — everybody can experience Truly Survival",
                    "No lifesteal, economy, or other game-changing mechanics",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-sky-400 mt-0.5 shrink-0 font-bold">›</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Combat ── orange ── */}
            <div className="rounded-xl border-2 border-orange-500 bg-[#1a0900] shadow-[0_0_50px_rgba(249,115,22,0.25)] overflow-hidden flex flex-col">
              <div className="bg-orange-900/50 px-6 py-5 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-orange-800/80 ring-2 ring-orange-400/60 shrink-0">
                  <ShieldIcon className="w-8 h-8 text-orange-300" />
                </div>
                <h3 className="text-xl font-bold text-orange-300">Combat</h3>
              </div>
              <div className="h-px bg-orange-600/40" />
              <div className="px-6 py-5 text-zinc-300 text-sm leading-relaxed">
                <ul className="space-y-2">
                  {[
                    "Balanced PvP for ALL playstyles, no matter your preferred style of combat",
                    "Mace and Explosion-based PvP disabled in the Overworld — fully allowed in the Nether & End",
                    "Combat Log Punishment — players who flee mid-fight are killed",
                    "Intuitive Duels system with preset kits, separate from the survival world",
                    "Place bets and wager on yours or other people's fights",
                    "Leaderboards for kills/duel wins — display only, no gameplay impact",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5 shrink-0 font-bold">›</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Disclaimer ── red ── */}
            <div className="rounded-xl border-2 border-red-600 bg-[#1a0000] shadow-[0_0_50px_rgba(239,68,68,0.25)] overflow-hidden flex flex-col">
              <div className="bg-red-900/50 px-6 py-5 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-red-800/80 ring-2 ring-red-400/60 shrink-0">
                  <BarrierIcon className="w-8 h-8 text-red-300" />
                </div>
                <h3 className="text-xl font-bold text-red-300">Disclaimer</h3>
              </div>
              <div className="h-px bg-red-600/40" />
              <div className="px-6 py-5 text-zinc-300 text-sm leading-relaxed space-y-3">
                <p>
                  Raiding, stealing, killing, and starting conflicts{" "}
                  <span className="text-white font-semibold">ARE</span> all allowed, but griefing
                  builds and killing pets are{" "}
                  <span className="text-red-400 font-semibold">NOT</span>.
                </p>
                <ul className="space-y-2">
                  {[
                    "You CAN destroy farms — these are tools, not creations",
                    "Actual builds, pets, and meaningful creations are protected",
                    "Violating these guidelines can result in temporary or permanent bans",
                    "Hacking, exploiting, or cheating in any form results in a hasty ban",
                    "Staff have final say in all scenarios — discretion is advised",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 shrink-0 font-bold">›</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* One Last Thing */}
          <div className="rounded-lg border border-[#1a3a1a] bg-[#0b120b] p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl">⛏️</span>
              <h3 className="text-xl font-bold text-white">One Last Thing!</h3>
            </div>
            <p className="text-zinc-400 leading-relaxed max-w-3xl mx-auto text-sm">
              Truly Survival is a spiritual successor to many servers before it, pulling inspiration
              from the likes of TrueSMP, Melon Survival, True Vanilla, and SimpleSMP. Our goal is to
              pull the best parts of each of those communities to tie together a fun, fair, and
              peaceful yet exciting experience for all those who wish to participate, no matter your
              style.
            </p>
            <p className="mt-4 text-green-400 font-semibold">
              We hope you have fun on Truly Survival!
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1a2e1a] py-8 px-4 text-center text-zinc-600 text-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-green-800 font-semibold">⚔ Truly Survival</span>
          <span>Not affiliated with Mojang Studios.</span>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5865F2] hover:text-[#7289da] transition-colors"
          >
            Join our Discord →
          </a>
        </div>
      </footer>
    </div>
  );
}
