"use client";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CLINIC_FEES } from "@/lib/pricing";
import { SITE } from "@/lib/site";
import { TIMES, bookableDays } from "@/lib/booking";
import { TERMS_VERSION } from "@/lib/terms";
import { useMoney } from "@/store/useCurrencyStore";
import { useBookingStore, type Service } from "@/store/useSession";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
const STEPS = ["Service", "Date & time", "Your details", "Review"];
const label = (k: string) => new Date(k + "T12:00:00Z").toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
export default function BookingWizard() {
  const { service, setService, reference, setReference } = useBookingStore(); const fmt = useMoney();
  const [step, setStep] = useState(0); const [days, setDays] = useState<string[]>([]); const [taken, setTaken] = useState<Set<string>>(new Set());
  const [slot, setSlot] = useState<{ day: string; time: string } | null>(null); const [f, setF] = useState({ name: "", phone: "", email: "" });
  const [err, setErr] = useState<string[]>([]); const [busy, setBusy] = useState(false);
  const loadTaken = useCallback(async (d: string[]) => { if (!d.length) return;
    const r = await fetch(`/api/bookings?from=${d[0]}&to=${d[d.length - 1]}`).then((x) => x.json()).catch(() => null); if (r?.taken) setTaken(new Set(r.taken)); }, []);
  useEffect(() => { const d = bookableDays(10); setDays(d); loadTaken(d); }, [loadTaken]);
  const user = useAuthStore((s) => s.user);
  useEffect(() => { if (user) setF((v) => ({ name: v.name || user.name, email: v.email || user.email, phone: v.phone || user.phone.replace(/^254/, "0") })); }, [user]);
  const fee = CLINIC_FEES.find((c) => c.id === service)!;
  const next = () => { if (step === 1 && !slot) return setErr(["Pick a date and time."]);
    if (step === 2) { const e: string[] = []; if (f.name.trim().length < 2) e.push("Enter your full name."); if (f.phone.replace(/\D/g, "").length < 9) e.push("Enter a valid phone number.");
      if (!/^\S+@\S+\.\S+$/.test(f.email)) e.push("Enter a valid email."); if (e.length) return setErr(e); }
    setErr([]); setStep(step + 1); };
  const submit = async () => { if (!slot) return; setBusy(true); setErr([]);
    const r = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ service, date: slot.day, time: slot.time, ...f, termsVersion: TERMS_VERSION }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (r.ok) return setReference(j.reference);
    if (j.error === "slot_taken") { setErr(["That slot was just taken. Pick another."]); setSlot(null); setStep(1); return loadTaken(days); }
    setErr([j.error === "unauthenticated" ? "Your session expired. Log in again." : j.error === "invalid_phone" ? "Enter a valid Kenyan phone number." : j.error === "terms_outdated" ? "Terms were updated. Reload the page." : "Could not complete the booking. Try again."]); };
  if (reference) return (<div className="rounded-2xl bg-white p-8 text-center"><h2 className="font-display text-3xl text-navy">Booking requested</h2>
    <p className="mt-3">Reference <b className="tabular-nums">{reference}</b> for {fee.label} on {slot ? label(slot.day) : ""} at {slot?.time} (EAT).</p>
    <p className="mt-3 text-sm text-ink/60">Keep this reference. Email/SMS confirmation and online fee payment are not connected yet; the clinic will confirm and explain how to pay.</p>
    <button onClick={() => { setReference(null); setStep(0); setSlot(null); loadTaken(days); }} className="mt-5 text-teal underline">Book another</button></div>);
  return (<div className="rounded-2xl border border-navy/10 bg-white p-6">
    <div className="mb-1 flex justify-between text-xs text-ink/60">{STEPS.map((s, i) => <span key={s} className={i === step ? "font-semibold text-teal" : ""}>{i + 1}. {s}</span>)}</div>
    <div className="mb-6 h-1.5 rounded bg-navy/10"><motion.div className="h-full rounded bg-teal" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
    {step === 0 && <div className="grid gap-3 sm:grid-cols-2">{CLINIC_FEES.map((c) => (<button key={c.id} aria-pressed={service === c.id} onClick={() => setService(c.id as Service)}
      className={cn("rounded-xl border p-4 text-left", service === c.id ? "border-teal bg-teal/10" : "border-navy/15")}><span className="block font-medium">{c.label}</span>
      <span className="text-sm text-ink/60">{c.blurb}</span><span className="mt-2 block font-display text-xl text-teal">{fmt(c.price)}</span></button>))}</div>}
    {step === 1 && <div className="space-y-4">{days.map((k) => (<div key={k}><p className="mb-1 text-sm font-medium">{label(k)}</p>
      <div className="flex flex-wrap gap-2">{TIMES.map((t) => { const on = slot?.day === k && slot.time === t; const off = taken.has(`${k}T${t}`);
        return <button key={t} disabled={off} aria-pressed={on} onClick={() => setSlot({ day: k, time: t })} className={cn("rounded-md border px-3 py-1 text-sm", on ? "border-teal bg-teal text-white" : "border-navy/15", off && "line-through opacity-30")}>{t}</button>; })}</div></div>))}
      <p className="text-xs text-ink/50">Times are East Africa Time. {SITE.hours}.</p></div>}
    {step === 2 && <div className="space-y-3">{([["name", "Full name", "text"], ["phone", "Phone", "tel"], ["email", "Email", "email"]] as const).map(([k, l, t]) => (
      <label key={k} className="block text-sm">{l}<input type={t} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2" /></label>))}
      <p className="text-xs text-ink/50">Do not enter medical history here. It is collected in person, with your procedure-specific consent form.</p></div>}
    {step === 3 && <dl className="space-y-2 text-sm"><div className="flex justify-between"><dt>Service</dt><dd>{fee.label}</dd></div><div className="flex justify-between"><dt>When</dt><dd>{slot ? label(slot.day) : ""} {slot?.time} EAT</dd></div>
      <div className="flex justify-between"><dt>Name</dt><dd>{f.name}</dd></div><div className="flex justify-between"><dt>Contact</dt><dd>{f.phone} · {f.email}</dd></div>
      <div className="flex justify-between border-t border-navy/10 pt-2 font-display text-xl"><dt>Clinic fee</dt><dd className="text-teal">{fmt(fee.price)}</dd></div></dl>}
    {err.length > 0 && <ul role="alert" className="mt-4 text-sm text-red-700">{err.map((e) => <li key={e}>{e}</li>)}</ul>}
    <div className="mt-6 flex justify-between"><button disabled={step === 0 || busy} onClick={() => { setErr([]); setStep(step - 1); }} className="text-sm text-ink/70 disabled:opacity-30">Back</button>
      {step < 3 ? <button onClick={next} className="rounded-lg bg-teal px-5 py-2 text-white">Continue</button> : <button disabled={busy} onClick={submit} className="rounded-lg bg-teal px-5 py-2 text-white disabled:opacity-50">{busy ? "Saving..." : "Request booking"}</button>}</div></div>);
}
