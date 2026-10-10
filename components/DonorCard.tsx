"use client";
import Link from "next/link";
import FavoriteButton from "./FavoriteButton";
import { motion } from "framer-motion";
import { Mic, Check, Plus } from "lucide-react";
import type { Donor } from "@/lib/donors";
import { useDonorStore } from "@/store/useDonorStore";
import { priceFor, TIER_LABEL } from "@/lib/pricing";
import { useMoney } from "@/store/useCurrencyStore";
import { cn } from "@/lib/utils";
export default function DonorCard({ d }: { d: Donor }) {
  const { compare, toggleCompare } = useDonorStore(); const fmt = useMoney(); const on = compare.includes(d.id);
  const full = !on && compare.length >= 3;
  return (<motion.article layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className={cn("group rounded-xl border bg-white p-5 transition", on ? "border-teal ring-2 ring-teal/30" : "border-navy/10")}>
    <header className="flex items-start justify-between"><div>
      <h3 className="font-display text-xl text-navy">{d.code}{d.tier === "PREMIUM" && <span className="ml-2 rounded bg-emerald/20 px-2 py-0.5 align-middle font-sans text-xs text-teal">{TIER_LABEL[d.tier]}</span>}</h3>
      <p className="text-sm text-ink/60">{d.height} cm · {d.hair} hair · {d.eyes} eyes</p></div>
      <div className="flex items-center gap-2">{d.hasAudio && <Mic size={16} className="text-teal" aria-label="Audio clip available" />}<FavoriteButton donorId={d.id} /></div></header>
    <dl className="mt-4 grid grid-cols-2 gap-y-1 text-sm">
      <dt className="text-ink/50">Ethnicity</dt><dd>{d.ethnicity}</dd>
      <dt className="text-ink/50">Education</dt><dd>{d.education}</dd>
      <dt className="text-ink/50">Blood / CMV</dt><dd>{d.blood} / {d.cmv}</dd>
      <dt className="text-ink/50">Carrier</dt><dd>{d.carrier}</dd></dl>
    <p className="mt-3 text-sm text-ink/60">{d.hobbies.join(", ")}</p>
    <Link href={`/donors/${d.id}`} className="mt-3 inline-block text-sm text-teal underline">View profile</Link>
    <footer className="mt-3 flex items-center justify-between">
      <div className="text-xs text-ink/60 space-y-0.5"><p>MOT20 · {d.mot20} left · ICI {fmt(priceFor(d.tier,"MOT20","ICI"))} / IUI {fmt(priceFor(d.tier,"MOT20","IUI"))}</p><p>MOT10 · {d.mot10} left · ICI {fmt(priceFor(d.tier,"MOT10","ICI"))} / IUI {fmt(priceFor(d.tier,"MOT10","IUI"))}</p></div>
      <button disabled={full} onClick={() => toggleCompare(d.id)} aria-pressed={on}
        className={cn("flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm", on ? "bg-teal text-white" : "border border-teal text-teal hover:bg-teal/10", full && "opacity-40")}>
        {on ? <Check size={14} /> : <Plus size={14} />} Compare</button></footer></motion.article>);
}
