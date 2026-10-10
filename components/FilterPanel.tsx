"use client";
import { useDonorStore } from "@/store/useDonorStore";
import { cn } from "@/lib/utils";
const Chips = ({ k, opts }: { k: "hair"|"eyes"|"ethnicity"|"blood"; opts: string[] }) => {
  const { filters, toggleIn } = useDonorStore();
  return (<div className="flex flex-wrap gap-2">{opts.map((o) => { const on = filters[k].includes(o);
    return <button key={o} aria-pressed={on} onClick={() => toggleIn(k, o)}
      className={cn("rounded-full border px-3 py-1 text-sm transition", on ? "border-teal bg-teal text-white" : "border-navy/20 hover:border-teal")}>{o}</button>; })}</div>); };
const Group = ({ t, children }: { t: string; children: React.ReactNode }) =>
  <fieldset className="space-y-2"><legend className="mb-1 text-sm font-semibold text-navy">{t}</legend>{children}</fieldset>;
export default function FilterPanel() {
  const { filters, set, reset } = useDonorStore();
  const Tog = ({ k, label }: { k: "cmvNegativeOnly"|"clearCarrierOnly"|"audioOnly"|"childPhotoOnly"; label: string }) =>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filters[k]} onChange={(e) => set(k, e.target.checked)} className="accent-teal" />{label}</label>;
  return (<div className="space-y-6">
    <Group t="Hair"><Chips k="hair" opts={["Brown","Black","Blonde","Red"]} /></Group>
    <Group t="Eyes"><Chips k="eyes" opts={["Brown","Blue","Green","Hazel"]} /></Group>
    <Group t="Ethnicity"><Chips k="ethnicity" opts={["Black / African","White / European","East Asian","South Asian","Latino","Mixed"]} /></Group>
    <Group t={`Minimum height: ${filters.minHeight} cm`}>
      <input type="range" min={160} max={190} value={filters.minHeight} onChange={(e) => set("minHeight", +e.target.value)} className="w-full accent-teal" /></Group>
    <Group t="Blood type"><Chips k="blood" opts={["A+","A-","B+","B-","AB+","O+","O-"]} /></Group>
    <Group t="Medical"><Tog k="cmvNegativeOnly" label="CMV negative only" /><Tog k="clearCarrierOnly" label="Clear carrier screening" /></Group>
    <Group t="Profile extras"><Tog k="audioOnly" label="Has audio clip" /><Tog k="childPhotoOnly" label="Has childhood photo" /></Group>
    <button onClick={reset} className="text-sm text-teal underline">Reset filters</button></div>);
}
