"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Donor } from "@/lib/donors";
import { priceFor, VIAL_INFO, PROCESSING_INFO, type VialType, type Processing } from "@/lib/pricing";
import { useMoney } from "@/store/useCurrencyStore";
import { useCartStore } from "@/store/useSession";
import { cn } from "@/lib/utils";
export default function ReservePanel({ d }: { d: Donor }) {
  const [vial, setVial] = useState<VialType>("MOT20"); const [proc, setProc] = useState<Processing>("IUI"); const [qty, setQty] = useState(1);
  const fmt = useMoney(); const add = useCartStore((s) => s.add); const router = useRouter();
  const stock = vial === "MOT20" ? d.mot20 : d.mot10; const unit = priceFor(d.tier, vial, proc); const q = Math.min(qty, Math.max(stock, 1));
  const Opt = ({ on, onClick, children, sub }: { on: boolean; onClick: () => void; children: React.ReactNode; sub?: string }) => (
    <button onClick={onClick} aria-pressed={on} className={cn("rounded-lg border px-3 py-2 text-left text-sm", on ? "border-teal bg-teal/10" : "border-navy/15")}>
      <span className="block font-medium">{children}</span>{sub && <span className="text-xs text-ink/50">{sub}</span>}</button>);
  return (<aside className="rounded-2xl border border-navy/10 bg-white p-5 lg:sticky lg:top-20">
    <h2 className="font-display text-xl text-navy">Reserve vials</h2>
    <p className="mt-3 text-sm font-medium">Vial type</p>
    <div className="mt-1 grid grid-cols-2 gap-2">{(["MOT10", "MOT20"] as VialType[]).map((v) => <Opt key={v} on={vial === v} onClick={() => { setVial(v); setQty(1); }} sub={`${v === "MOT20" ? d.mot20 : d.mot10} in stock`}>{VIAL_INFO[v].label}</Opt>)}</div>
    <p className="mt-3 text-sm font-medium">Processing</p>
    <div className="mt-1 grid grid-cols-2 gap-2">{(["ICI", "IUI"] as Processing[]).map((p) => <Opt key={p} on={proc === p} onClick={() => setProc(p)} sub={fmt(priceFor(d.tier, vial, p))}>{PROCESSING_INFO[p].label}</Opt>)}</div>
    <div className="mt-4 flex items-center justify-between"><span className="text-sm font-medium">Quantity</span>
      <div className="flex items-center gap-3"><button aria-label="Decrease" disabled={q <= 1} onClick={() => setQty(q - 1)} className="h-8 w-8 rounded border border-navy/20 disabled:opacity-30">-</button>
        <span className="w-6 text-center tabular-nums">{q}</span>
        <button aria-label="Increase" disabled={q >= stock} onClick={() => setQty(q + 1)} className="h-8 w-8 rounded border border-navy/20 disabled:opacity-30">+</button></div></div>
    <div className="mt-4 flex items-baseline justify-between border-t border-navy/10 pt-4"><span className="text-sm text-ink/60">Total</span><span className="font-display text-2xl text-teal">{fmt(unit * q)}</span></div>
    <button disabled={stock < 1} onClick={() => { add({ donorId: d.id, vial, processing: proc, qty: q }); router.push("/checkout"); }}
      className="mt-4 w-full rounded-lg bg-teal px-4 py-3 font-medium text-white disabled:opacity-40">{stock < 1 ? "Out of stock" : "Reserve and continue"}</button>
    <p className="mt-2 text-xs text-ink/50">Stock is not held until checkout is completed.</p></aside>);
}
