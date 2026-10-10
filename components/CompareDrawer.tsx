"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { priceFor, TIER_LABEL } from "@/lib/pricing";
import { useMoney } from "@/store/useCurrencyStore";
import { DONORS } from "@/lib/donors";
import { useDonorStore } from "@/store/useDonorStore";
const rows: [string, (d: (typeof DONORS)[0], f: (n: number) => string) => string][] = [
  ["Height", (d) => `${d.height} cm`], ["Hair", (d) => d.hair], ["Eyes", (d) => d.eyes], ["Ethnicity", (d) => d.ethnicity],
  ["Blood type", (d) => d.blood], ["CMV", (d) => d.cmv], ["Carrier screening", (d) => d.carrier],
  ["Education", (d) => d.education],
  ["Tier", (d) => TIER_LABEL[d.tier]],
  ["MOT20 price (ICI / IUI)", (d, f) => `${f(priceFor(d.tier,"MOT20","ICI"))} / ${f(priceFor(d.tier,"MOT20","IUI"))}`],
  ["MOT10 price (ICI / IUI)", (d, f) => `${f(priceFor(d.tier,"MOT10","ICI"))} / ${f(priceFor(d.tier,"MOT10","IUI"))}`], ["Vials (MOT20 / MOT10)", (d) => `${d.mot20} / ${d.mot10}`]];
export default function CompareDrawer() {
  const { compare, toggleCompare, clearCompare } = useDonorStore(); const fmt = useMoney(); const [open, setOpen] = useState(false);
  const picks = DONORS.filter((d) => compare.includes(d.id));
  return (<>
    <AnimatePresence>{picks.length > 0 && (
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 bg-navy px-6 py-3 text-paper">
        <div className="flex flex-wrap gap-2">{picks.map((d) => (
          <span key={d.id} className="flex items-center gap-1 rounded-full bg-paper/10 px-3 py-1 text-sm">{d.code}
            <button aria-label={`Remove ${d.code}`} onClick={() => toggleCompare(d.id)}><X size={14} /></button></span>))}</div>
        <div className="flex gap-3"><button onClick={clearCompare} className="text-sm text-paper/70 underline">Clear</button>
          <button disabled={picks.length < 2} onClick={() => setOpen(true)}
            className="rounded-lg bg-emerald px-4 py-2 font-medium text-navy disabled:opacity-40">Compare {picks.length}/3</button></div>
      </motion.div>)}</AnimatePresence>
    <AnimatePresence>{open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 grid place-items-center bg-navy/60 p-4" onClick={() => setOpen(false)}>
        <div role="dialog" aria-modal className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex justify-between"><h2 className="font-display text-2xl text-navy">Side by side</h2>
            <button aria-label="Close" onClick={() => setOpen(false)}><X /></button></div>
          <table className="w-full text-left text-sm"><thead><tr><th />{picks.map((d) => <th key={d.id} className="pb-2 font-display text-lg text-navy">{d.code}</th>)}</tr></thead>
            <tbody>{rows.map(([l, f]) => (<tr key={l} className="border-t border-navy/10">
              <td className="py-2 pr-4 text-ink/50">{l}</td>{picks.map((d) => <td key={d.id}>{f(d, fmt)}</td>)}</tr>))}</tbody></table>
        </div></motion.div>)}</AnimatePresence></>);
}
