"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
const DURATION_S = 30;
export default function AudioPlayer({ seed, available }: { seed: number; available: boolean }) {
  const [playing, setPlaying] = useState(false); const [p, setP] = useState(0);
  useEffect(() => { if (!playing) return;
    const t = setInterval(() => setP((v) => { if (v >= 1) { setPlaying(false); return 0; } return v + 0.1 / DURATION_S; }), 100);
    return () => clearInterval(t); }, [playing]);
  if (!available) return <p className="rounded-xl border border-navy/10 bg-white p-4 text-sm text-ink/60">No audio introduction for this donor.</p>;
  const bars = Array.from({ length: 40 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(seed * 1.7 + i * 0.9)));
  return (<div className="rounded-xl border border-navy/10 bg-white p-4">
    <div className="flex items-center gap-4">
      <button onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause audio introduction" : "Play audio introduction"}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal text-white">{playing ? <Pause size={18} /> : <Play size={18} />}</button>
      <div className="flex h-12 flex-1 items-center gap-[3px]" aria-hidden>
        {bars.map((h, i) => (<motion.span key={i} className={`w-1 flex-1 rounded-full ${i / bars.length < p ? "bg-teal" : "bg-navy/20"}`} style={{ height: `${h * 100}%` }}
          animate={{ scaleY: playing ? [1, 0.55, 1] : 1 }} transition={{ repeat: playing ? Infinity : 0, duration: 0.7 + (i % 5) * 0.12 }} />))}</div>
      <span className="text-xs tabular-nums text-ink/60">0:{String(Math.floor(p * DURATION_S)).padStart(2, "0")} / 0:{DURATION_S}</span></div>
    <p className="mt-2 text-xs text-ink/50">Demo player: no real audio file attached yet.</p></div>);
}
