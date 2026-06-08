"use client";
import { useState } from "react";

export function SyncRankButton({ tier }: { tier: string }) {
  const [status, setStatus] = useState<"idle" | "syncing" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setStatus("syncing");
    setMessage(null);

    const res = await fetch("/api/user/sync-rank", { method: "POST" });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setStatus("ok");
      setMessage("In-game rank synced. Rejoin the server if perks don't show yet.");
      setTimeout(() => {
        setStatus("idle");
        setMessage(null);
      }, 5000);
    } else {
      setStatus("error");
      setMessage(data.error ?? "Sync failed. Check your username and try again.");
      setTimeout(() => {
        setStatus("idle");
        setMessage(null);
      }, 8000);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSync}
        disabled={status === "syncing"}
        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors"
      >
        {status === "syncing" ? "Syncing..." : status === "ok" ? "Synced ✓" : "Sync In-Game Rank"}
      </button>
      {message && (
        <p className={`text-xs mt-2 ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>
          {message}
        </p>
      )}
      <p className="text-zinc-600 text-xs mt-2">
        Current rank: <span className="text-zinc-400">{tier}</span>
      </p>
    </div>
  );
}
