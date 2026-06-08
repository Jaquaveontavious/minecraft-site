"use client";
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";

type Props = {
  tier: "basic" | "true" | "true_plus";
  label: string;
  className: string;
};

export function PurchaseButton({ tier, label, className }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);

    if (!session) {
      signIn("discord");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (res.status === 403) {
        setError("You need True rank first.");
        return;
      }

      if (res.status === 400) {
        const text = await res.text();
        setError(
          text.includes("Minecraft username")
            ? "Set your Minecraft username on the dashboard first."
            : text || "Invalid request."
        );
        return;
      }

      if (!res.ok) {
        setError("Something went wrong. Try again.");
        return;
      }

      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`${className} disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {loading ? "Loading..." : label}
      </button>
      {error && (
        <p className="text-red-400 text-xs text-center mt-2">{error}</p>
      )}
    </div>
  );
}