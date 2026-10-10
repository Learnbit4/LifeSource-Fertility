"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { useDonorStore } from "@/store/useDonorStore";
const Sel = ({ label, opts, v, on }: { label: string; opts: string[]; v: string; on: (s: string) => void }) => (
  <label className="flex flex-col gap-1 text-sm text-navy/70">{label}
    <select value={v} onChange={(e) => on(e.target.value)} className="rounded-lg border border-navy/15 bg-white px-3 py-2 text-ink">
      <option value="">Any</option>{opts.map((o) => <option key={o}>{o}</option>)}</select></label>);
export default function HeroSearch() {
  const r = useRouter(); const { toggleIn, set } = useDonorStore();
  const [f, setF] = useState({ eyes: "", hair: "", ethnicity: "", height: "" });
  const go = () => { if (f.eyes) toggleIn("eyes", f.eyes); if (f.hair) toggleIn("hair", f.hair);
    if (f.ethnicity) toggleIn("ethnicity", f.ethnicity); if (f.height) set("minHeight", +f.height); r.push("/donors"); };
  return (<div className="grid gap-4 rounded-2xl bg-white p-5 shadow-lg sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
    <Sel label="Eye color" opts={["Brown","Blue","Green","Hazel"]} v={f.eyes} on={(eyes) => setF({ ...f, eyes })} />
    <Sel label="Hair color" opts={["Brown","Black","Blonde","Red"]} v={f.hair} on={(hair) => setF({ ...f, hair })} />
    <Sel label="Ethnicity" opts={["Black / African","White / European","East Asian","South Asian","Latino","Mixed"]} v={f.ethnicity} on={(ethnicity) => setF({ ...f, ethnicity })} />
    <Sel label="Min. height (cm)" opts={["165","170","175","180","185"]} v={f.height} on={(height) => setF({ ...f, height })} />
    <button onClick={go} className="flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2.5 font-medium text-white hover:bg-navy">
      <Search size={16} /> Search donors</button></div>);
}
