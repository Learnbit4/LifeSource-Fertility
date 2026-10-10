"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DONORS } from "@/lib/donors";
import { priceFor, VIAL_INFO, PROCESSING_INFO, kesFromUsd, USD_TO_KES } from "@/lib/pricing";
import { TERMS_VERSION } from "@/lib/terms";
import { useMoney } from "@/store/useCurrencyStore";
import { useCartStore } from "@/store/useSession";
import { useAuthStore } from "@/store/useAuthStore";
type Phase = "idle" | "working" | "awaiting" | "paid" | "failed" | "expired";
type Order = { orderId: string; reference: string; kesAmount: number; rate: number };
const ERR: Record<string, string> = { unauthenticated: "Your session expired. Log in again.", forbidden: "Request blocked. Reload the page.", out_of_stock: "One of the vials just sold out. Remove it and try again.", terms_outdated: "The terms were updated. Reload the page and accept them again.",
  invalid_phone: "Enter a valid Safaricom number (e.g. 0712 345 678).", too_many_requests: "Too many attempts. Wait a few minutes.", payment_in_progress: "A payment prompt is already on your phone.",
  too_many_attempts: "Too many payment attempts for this order.", order_not_payable: "This order can no longer be paid. Start a new reservation.", stk_failed: "We couldn't send the M-Pesa prompt. Try again." };
const post = async (url: string, body: unknown) => { const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return { ok: r.ok, data: await r.json().catch(() => ({})) }; };
export default function OrderSummary() {
  const { items, remove, clear } = useCartStore(); const fmt = useMoney();
  const [f, setF] = useState({ name: "", phone: "", email: "" }); const [phase, setPhase] = useState<Phase>("idle");
  const [order, setOrder] = useState<Order | null>(null); const [msg, setMsg] = useState(""); const [receipt, setReceipt] = useState(""); const [tick, setTick] = useState(0);
  useEffect(() => { if (phase !== "awaiting" || !order) return; let n = 0;
    const t = setInterval(async () => { n++;
      const r = await fetch(`/api/orders/${order.orderId}`).then((x) => x.json()).catch(() => null);
      if (r?.status === "PAID") { setReceipt(r.payment?.receipt ?? ""); setPhase("paid"); clear(); clearInterval(t); }
      else if (r?.status === "EXPIRED") { setPhase("expired"); clearInterval(t); }
      else if (r?.payment && r.payment.status !== "INITIATED") { setMsg(r.payment.resultDesc || "Payment was not completed."); setPhase("failed"); clearInterval(t); }
      else if (n >= 60) { setMsg("No confirmation yet. If money left your account, keep the M-Pesa message and quote your reference."); setPhase("failed"); clearInterval(t); } }, 3000);
    return () => clearInterval(t); }, [phase, order, tick, clear]);
  const user = useAuthStore((s) => s.user);
  useEffect(() => { if (user) setF((v) => ({ name: v.name || user.name, email: v.email || user.email, phone: v.phone || user.phone.replace(/^254/, "0") })); }, [user]);
  if (phase === "paid") return <div className="rounded-xl bg-white p-8 text-center"><h2 className="font-display text-3xl text-navy">Payment received</h2>
    <p className="mt-3">Order <b>{order?.reference}</b>{receipt && <> · M-Pesa receipt <b>{receipt}</b></>}</p><p className="mt-2 text-sm text-ink/60">Keep this reference. Email/SMS confirmation is not connected yet.</p></div>;
  if (!items.length && !order) return <div className="rounded-xl bg-white p-6">Your reservation list is empty. <Link href="/donors" className="text-teal underline">Browse donors</Link>.</div>;
  const rows = items.map((i) => { const d = DONORS.find((x) => x.id === i.donorId)!; return { i, d, line: priceFor(d.tier, i.vial, i.processing) * i.qty }; });
  const total = rows.reduce((a, r) => a + r.line, 0); const locked = !!order && phase !== "idle";
  const pay = async () => {
    setMsg(""); setPhase("working");
    let o = order;
    if (!o) { const r = await post("/api/orders", { buyer: f, items: items.map(({ donorId, vial, processing, qty }) => ({ donorId, vial, processing, qty })), termsVersion: TERMS_VERSION });
      if (!r.ok) { setMsg(ERR[r.data.error] ?? "Please check your details and try again."); return setPhase("idle"); }
      o = r.data as Order; setOrder(o); }
    const s = await post("/api/pay/stk", { orderId: o.orderId, phone: f.phone });
    if (!s.ok) { setMsg(ERR[s.data.error] ?? "Payment could not be started."); return setPhase(s.data.error === "order_not_payable" ? "expired" : "failed"); }
    setTick((x) => x + 1); setPhase("awaiting");
  };
  const input = (k: "name" | "phone" | "email", l: string, t: string) => (<label className="block text-sm">{l}<input type={t} value={f[k]} disabled={locked && phase !== "failed"} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2" /></label>);
  return (<div className="space-y-4 rounded-xl bg-white p-6">
    {rows.map(({ i, d, line }, k) => (<div key={k} className="flex items-center justify-between border-b border-navy/10 pb-3 text-sm">
      <span><b>{d.code}</b> · {VIAL_INFO[i.vial].label} · {PROCESSING_INFO[i.processing].label} × {i.qty}{!locked && <button onClick={() => remove(k)} className="ml-3 text-xs text-teal underline">Remove</button>}</span><span>{fmt(line)}</span></div>))}
    <div className="flex justify-between font-display text-xl"><span>Total</span><span className="text-teal">{fmt(total)}</span></div>
    <p className="text-sm text-ink/70">M-Pesa charges in Kenyan shillings: you will pay <b>KSh {(order?.kesAmount ?? kesFromUsd(total)).toLocaleString("en-KE")}</b> (1 USD = {order?.rate ?? USD_TO_KES} KES, fixed when you pay).</p>
    <div className="grid gap-3 sm:grid-cols-3">{input("name", "Full name", "text")}{input("phone", "M-Pesa phone", "tel")}{input("email", "Email", "email")}</div>
    {phase === "awaiting" && <p role="status" className="rounded bg-teal/10 p-3 text-sm">Check your phone and enter your M-Pesa PIN. Your vials are held for 15 minutes.</p>}
    {msg && <p role="alert" className="text-sm text-red-700">{msg}</p>}
    {phase === "expired" ? <p className="text-sm">This reservation expired and the vials were released. <Link href="/donors" className="text-teal underline">Start again</Link>.</p> :
      <button disabled={phase === "working" || phase === "awaiting"} onClick={pay} className="w-full rounded-lg bg-teal px-4 py-3 font-medium text-white disabled:opacity-40">
        {phase === "working" ? "Sending prompt..." : phase === "awaiting" ? "Waiting for payment..." : phase === "failed" ? "Try payment again" : "Pay with M-Pesa"}</button>}
    <p className="text-sm">Need an IUI or IVF procedure? <Link href="/book" className="text-teal underline">Book at our clinic</Link>.</p></div>);
}
