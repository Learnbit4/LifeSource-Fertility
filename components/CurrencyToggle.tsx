"use client";
import { useCurrencyStore, type Cur } from "@/store/useCurrencyStore";
import { cn } from "@/lib/utils";
export default function CurrencyToggle() {
  const { cur, set } = useCurrencyStore();
  return (<div role="group" aria-label="Currency" className="inline-flex rounded-md border border-navy/15 bg-white p-0.5 text-xs">
    {(["USD", "KES"] as Cur[]).map((c) => (<button key={c} aria-pressed={cur === c} onClick={() => set(c)}
      className={cn("rounded px-2 py-1", cur === c ? "bg-navy text-paper" : "text-ink/70")}>{c}</button>))}</div>);
}
