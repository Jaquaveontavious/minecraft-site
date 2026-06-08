"use client";
import { useState } from "react";

export function MinecraftUsernameForm({ current }: { current: string | null }) {
  const [value, setValue] = useState(current ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage(null);

    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minecraft_username: value }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus("saved");
      if (data.rank_synced) {
        setMessage("Saved and in-game rank granted.");
      } else if (data.rank_sync_error) {
        setMessage(`Saved, but in-game sync failed: ${data.rank_sync_error}`);
      } else {
        setMessage("Saved.");
      }
      setTimeout(() => {
        setStatus("idle");
        setMessage(null);
      }, 5000);
    } else {
      setStatus("error");
      setMessage("Invalid username. Try again.");
      setTimeout(() => {
        setStatus("idle");
        setMessage(null);
      }, 3000);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="YourMinecraftName"
          maxLength={16}
          className="flex-1 px-3 py-2 rounded bg-[#0f1f0f] border border-[#2d4a2d] text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-green-700"
        />
        <button
          type="submit"
          disabled={status === "saving" || !value.trim()}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded transition-colors"
        >
          {status === "saving" ? "Saving..." : status === "saved" ? "Saved ✓" : "Save"}
        </button>
      </form>
      {message && (
        <p className={`text-xs mt-2 ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}