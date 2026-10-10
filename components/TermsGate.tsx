"use client";
import { useState } from "react";
import { TERMS, TERMS_VERSION, type Kind } from "@/lib/terms";
import { useConsentStore } from "@/store/useConsentStore";
export default function TermsGate({ kind, children }: { kind: Kind; children: React.ReactNode }) {
  const { accepted, accept } = useConsentStore();
  const [end, setEnd] = useState(false); const [checked, setChecked] = useState(false);
  const t = TERMS[kind];
  if (accepted[kind]?.version === TERMS_VERSION) return <>{children}</>;
  return (<div className="mx-auto max-w-2xl rounded-2xl border border-navy/10 bg-white p-6">
    <h2 className="font-display text-2xl text-navy">{t.title}</h2>
    <p className="mt-1 text-sm text-ink/60">Read to the end to enable acceptance. Version {TERMS_VERSION}.</p>
    <div tabIndex={0} role="region" aria-label={t.title}
      onScroll={(e) => { const el = e.currentTarget; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setEnd(true); }}
      className="mt-4 h-72 space-y-4 overflow-y-auto rounded-lg border border-navy/10 p-4 text-sm">
      {t.clauses.map(([h, b]) => <section key={h}><h3 className="font-semibold text-navy">{h}</h3><p className="text-ink/80">{b}</p></section>)}</div>
    <label className="mt-4 flex items-start gap-2 text-sm"><input type="checkbox" disabled={!end} checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1 accent-teal" />
      <span className={end ? "" : "text-ink/40"}>I have read and accept these terms and conditions.</span></label>
    <button disabled={!checked} onClick={() => accept(kind)} className="mt-4 rounded-lg bg-teal px-5 py-2.5 font-medium text-white disabled:opacity-40">Accept and continue</button>
  </div>);
}
