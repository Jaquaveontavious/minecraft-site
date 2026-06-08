"use client";
import { useSearchParams } from "next/navigation";

export function PurchaseSuccessBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("success") !== "true") return null;

  return (
    <div className="mb-8 rounded-lg border border-emerald-800/50 bg-emerald-950/30 p-4">
      <p className="text-emerald-300 text-sm font-semibold">Payment successful!</p>
      <p className="text-zinc-400 text-sm mt-1">
        Your Discord rank should be active. Add your Minecraft username below, then sync your
        in-game rank.
      </p>
    </div>
  );
}
