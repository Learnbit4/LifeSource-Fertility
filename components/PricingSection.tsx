"use client";
import { useState } from "react";
import { VIAL_INFO, PROCESSING_INFO, TIER_LABEL, DONOR_REGISTRATION_FEE, DONOR_FEE_COVERS, CLINIC_FEES, PRICES_CONFIRMED, priceFor, USD_TO_KES, type VialType, type Processing, type Tier } from "@/lib/pricing";
import Link from "next/link";
import { useBookingStore, type Service } from "@/store/useSession";
import { cn } from "@/lib/utils";
import { useMoney, useCurrencyStore } from "@/store/useCurrencyStore";
export default function PricingSection() {
  const [tier, setTier] = useState<Tier>("STANDARD");
  const fmt = useMoney(); const setService = useBookingStore((s) => s.setService); const cur = useCurrencyStore((x) => x.cur);
  return (<section id="pricing" className="mx-auto max-w-5xl px-6 py-20">
    <h2 className="font-display text-3xl text-navy">Pricing per vial</h2>
    <p className="mt-2 max-w-xl text-ink/70">Price depends on the donor tier, the vial quality (motile count) and how the sample is processed.</p>
    {!PRICES_CONFIRMED && <p role="note" className="mt-3 inline-block rounded bg-amber-100 px-3 py-1 text-sm text-amber-900">Sample pricing: not final.</p>}
    {cur === "KES" && <p className="mt-3 text-sm text-ink/60">KES amounts are approximate (1 USD ≈ {USD_TO_KES} KES). Final amount confirmed at checkout.</p>}
    <div role="tablist" className="mt-6 inline-flex rounded-lg border border-navy/15 bg-white p-1">
      {(Object.keys(TIER_LABEL) as Tier[]).map((t) => (
        <button key={t} role="tab" aria-selected={tier === t} onClick={() => setTier(t)}
          className={cn("rounded-md px-4 py-1.5 text-sm", tier === t ? "bg-teal text-white" : "text-ink/70")}>{TIER_LABEL[t]} donors</button>))}</div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {(["MOT10", "MOT20"] as VialType[]).map((v) => (
        <div key={v} className="rounded-xl border border-navy/10 bg-white p-6">
          <h3 className="font-display text-xl text-navy">{VIAL_INFO[v].label}</h3>
          <p className="mt-1 text-sm text-ink/60">{VIAL_INFO[v].blurb}</p>
          <ul className="mt-4 space-y-3">{(["ICI", "IUI"] as Processing[]).map((p) => (
            <li key={p} className="flex items-baseline justify-between border-t border-navy/10 pt-3">
              <span><span className="font-medium">{PROCESSING_INFO[p].label}</span><span className="block text-xs text-ink/50">{PROCESSING_INFO[p].blurb}</span></span>
              <span className="font-display text-2xl text-teal">{fmt(priceFor(tier, v, p))}</span></li>))}</ul>
        </div>))}
    </div>
    <h3 className="mt-10 font-display text-2xl text-navy">Clinic fees</h3>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">{CLINIC_FEES.map((c) => (
      <div key={c.id} className="flex items-baseline justify-between rounded-xl border border-navy/10 bg-white p-6">
        <span><span className="font-medium">{c.label}</span><span className="block text-xs text-ink/50">{c.blurb}</span></span>
        <span className="text-right"><span className="block font-display text-2xl text-teal">{fmt(c.price)}</span><Link href="/book" onClick={() => setService(c.id as Service)} className="text-sm text-teal underline">Book</Link></span></div>))}</div>
    <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-navy p-6 text-paper">
      <div><h3 className="font-display text-xl">Become a donor</h3>
        <p className="text-sm text-paper/70">One-time registration fee. {DONOR_FEE_COVERS}</p></div>
      <span className="font-display text-3xl text-emerald">{fmt(DONOR_REGISTRATION_FEE)}</span></div>
  </section>);
}
