"use client";
import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
// No image URL is ever put in the page for unverified visitors: the server refuses them (see /api/donors/[id]/photo).
export default function PhotoGate({ donorId, hasChild }: { donorId: string; hasChild: boolean }) {
  const { user, loaded } = useAuthStore(); const [view, setView] = useState<"adult" | "child">("adult");
  return (<div>
    <div className="mb-3 inline-flex rounded-lg border border-navy/15 bg-white p-1 text-sm">
      {(["adult", "child"] as const).map((v) => (<button key={v} disabled={v === "child" && !hasChild} onClick={() => setView(v)} aria-pressed={view === v}
        className={cn("rounded-md px-3 py-1", view === v ? "bg-teal text-white" : "text-ink/70", v === "child" && !hasChild && "opacity-40")}>{v === "adult" ? "Adult photo" : "Childhood photo"}</button>))}</div>
    <div className="relative aspect-[4/5] max-w-xs overflow-hidden rounded-xl bg-gradient-to-br from-teal/40 via-navy/30 to-emerald/40">
      {user?.verified ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={`/api/donors/${donorId}/photo?view=${view}`} alt={`${view} photo of donor`} className="h-full w-full object-cover" />
        : loaded && (<div className="absolute inset-0 grid place-items-center bg-navy/40 p-4 text-center text-paper"><div><Lock className="mx-auto mb-2" size={22} />
          {!user ? <><p className="text-sm">Log in with a verified account to view photos.</p><Link href={`/login?next=/donors/${donorId}`} className="mt-3 inline-block rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-navy">Log in</Link></>
            : <p className="text-sm">Your account is awaiting verification by our team.</p>}</div></div>)}</div></div>);
}
