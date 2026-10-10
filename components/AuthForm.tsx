"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
const ERR: Record<string, string> = { invalid_credentials: "Wrong email or password.", email_taken: "An account with this email already exists. Try logging in.",
  weak_password: "Choose a stronger password: at least 10 characters and not containing your email name.", invalid_phone: "Enter a valid Kenyan phone number (e.g. 0712 345 678).",
  invalid_request: "Check the form: name, a valid email, and a password of at least 10 characters.", too_many_requests: "Too many attempts. Wait a few minutes and try again.", forbidden: "Request blocked. Reload the page and try again." };
const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard");
export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const refresh = useAuthStore((s) => s.refresh); const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const reg = mode === "register";
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reg ? f : { email: f.email, password: f.password }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (!r.ok) return setErr(ERR[j.error] ?? "Something went wrong. Try again.");
    await refresh(); window.location.href = safeNext(new URLSearchParams(window.location.search).get("next")); };
  const field = (k: keyof typeof f, label: string, type: string, auto: string) => (
    <label className="block text-sm">{label}<input required type={type} autoComplete={auto} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2" /></label>);
  return (<form onSubmit={submit} className="mx-auto max-w-md space-y-4 rounded-2xl border border-navy/10 bg-white p-6">
    <h1 className="font-display text-3xl text-navy">{reg ? "Create your account" : "Log in"}</h1>
    {reg && field("name", "Full name", "text", "name")}{field("email", "Email", "email", "email")}{reg && field("phone", "Phone (M-Pesa number)", "tel", "tel")}
    {field("password", reg ? "Password (min. 10 characters)" : "Password", "password", reg ? "new-password" : "current-password")}
    {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
    <button disabled={busy} className="w-full rounded-lg bg-teal px-4 py-3 font-medium text-white disabled:opacity-50">{busy ? "Please wait..." : reg ? "Create account" : "Log in"}</button>
    <p className="text-sm text-ink/70">{reg ? <>Already registered? <Link href="/login" className="text-teal underline">Log in</Link></> : <>New here? <Link href="/register" className="text-teal underline">Create an account</Link></>}</p></form>);
}
