"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { Donor } from "@/lib/donors";
import { detailFor } from "@/lib/donorDetail";
import { TIER_LABEL } from "@/lib/pricing";
import FavoriteButton from "./FavoriteButton"; import AudioPlayer from "./AudioPlayer"; import PhotoGate from "./PhotoGate"; import ReservePanel from "./ReservePanel";
import { cn } from "@/lib/utils";
const TABS = ["Overview", "Medical & genetic", "Family history"] as const;
export default function DonorProfile({ d }: { d: Donor }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview"); const x = detailFor(d);
  const Row = ({ a, b }: { a: string; b: string }) => <div className="flex justify-between gap-4 border-t border-navy/10 py-2 text-sm"><dt className="text-ink/60">{a}</dt><dd className="text-right">{b}</dd></div>;
  return (<div className="mx-auto max-w-6xl px-6 py-10">
    <Link href="/donors" className="inline-flex items-center gap-1 text-sm text-teal"><ArrowLeft size={14} /> All donors</Link>
    <h1 className="mt-3 font-display text-4xl text-navy">{d.code}{d.tier === "PREMIUM" && <span className="ml-3 rounded bg-emerald/20 px-2 py-1 align-middle font-sans text-sm text-teal">{TIER_LABEL[d.tier]}</span>}</h1>
    <p className="text-ink/60">{d.height} cm · {d.hair} hair · {d.eyes} eyes · {d.ethnicity}</p>
    <div className="mt-3"><FavoriteButton donorId={d.id} withLabel /></div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]"><div className="space-y-8">
      <AudioPlayer seed={Number(d.id)} available={d.hasAudio} />
      <div role="tablist" className="flex gap-1 border-b border-navy/10">{TABS.map((t) => (
        <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("relative px-4 py-2 text-sm", tab === t ? "text-teal" : "text-ink/60")}>{t}
          {tab === t && <motion.span layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-teal" />}</button>))}</div>
      <AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
        {tab === "Overview" && <dl><p className="mb-3 text-ink/80">{x.bio}</p><Row a="Education" b={d.education} /><Row a="Hobbies" b={d.hobbies.join(", ")} /><Row a="Blood type" b={d.blood} /></dl>}
        {tab === "Medical & genetic" && <dl>{x.screening.map((s) => <Row key={s.test} a={s.test} b={s.result} />)}<p className="mt-3 text-xs text-ink/50">Demo data. Real results must come from verified lab records.</p></dl>}
        {tab === "Family history" && <dl>{x.family.map((f) => <Row key={f.relation} a={f.relation} b={f.note} />)}<p className="mt-3 text-xs text-ink/50">Self-reported by the donor. Demo data.</p></dl>}
      </motion.div></AnimatePresence>
      <section><h2 className="mb-3 font-display text-xl text-navy">Photos</h2><PhotoGate donorId={d.id} hasChild={d.hasChildPhoto} /></section></div>
      <ReservePanel d={d} /></div></div>);
}
