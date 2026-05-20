"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const TIER_STYLE: Record<string, { label: string; color: string }> = {
  free:      { label: "Free",  color: "text-zinc-500" },
  basic:     { label: "Basic", color: "text-amber-300" },
  true:      { label: "True",  color: "text-emerald-300" },
  true_plus: { label: "True+", color: "text-violet-300" },
};

export function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#080d08]/90 backdrop-blur-sm border-b border-[#1a2e1a]">
      <span className="font-bold text-green-400 tracking-wide text-lg">
        ⚔ Truly Survival
      </span>

      <div className="flex items-center gap-6">
        <a
          href="#ranks"
          className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Ranks
        </a>
        <a
          href="#about"
          className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors"
        >
          About
        </a>

        {/* Auth area */}
        {status === "loading" ? (
          <div className="w-8 h-8 rounded-full bg-[#1a2e1a] animate-pulse" />
        ) : session ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#0f1f0f] border border-[#2d4a2d] hover:border-green-700 transition-colors"
            >
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "avatar"}
                  className="w-7 h-7 rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-green-800 flex items-center justify-center text-xs font-bold text-green-300">
                  {session.user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <span className="hidden sm:block text-sm text-zinc-300 max-w-[120px] truncate">
                {session.user.name}
              </span>
              <svg
                className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border border-[#1a3a1a] bg-[#0b120b] shadow-xl overflow-hidden">
                {/* Rank badge */}
                <div className="px-4 py-2.5 border-b border-[#1a3a1a]">
                  <div className="text-xs text-zinc-600 mb-0.5">Rank</div>
                  <div className={`text-sm font-bold ${TIER_STYLE[session.user.tier ?? "free"]?.color ?? "text-zinc-500"}`}>
                    {TIER_STYLE[session.user.tier ?? "free"]?.label ?? "Free"}
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-zinc-300 hover:bg-[#0f1f0f] hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  Dashboard
                </Link>
                <div className="border-t border-[#1a3a1a]" />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-zinc-400 hover:bg-[#1a0505] hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => signIn("discord")}
            className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-semibold rounded transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            Login with Discord
          </button>
        )}
      </div>
    </nav>
  );
}
