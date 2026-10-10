"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
export default function AuthNav() {
  const { user, loaded } = useAuthStore();
  if (!loaded) return <span className="w-24" />;
  if (!user) return <><Link href="/login" className="text-ink/80 hover:text-teal">Log in</Link><Link href="/register" className="rounded-lg bg-teal px-3 py-1 text-white">Create account</Link></>;
  return <><Link href="/dashboard" className="text-ink/80 hover:text-teal">Dashboard</Link>
    <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }} className="text-ink/60 underline">Log out</button></>;
}
