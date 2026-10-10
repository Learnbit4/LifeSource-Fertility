import { TERMS, TERMS_VERSION } from "@/lib/terms";
export const metadata = { title: "Terms and Conditions" };
export default function Page() {
  return (<main className="mx-auto max-w-3xl px-6 py-16"><h1 className="font-display text-4xl text-navy">Terms and Conditions</h1>
    <p className="mt-2 rounded bg-amber-100 px-3 py-1 text-sm text-amber-900">Draft: pending legal review. Version {TERMS_VERSION}.</p>
    {(["donor", "buyer"] as const).map((k) => (<section key={k} className="mt-10"><h2 className="font-display text-2xl text-navy">{TERMS[k].title}</h2>
      {TERMS[k].clauses.map(([h, b]) => <div key={h} className="mt-4"><h3 className="font-semibold">{h}</h3><p className="text-ink/80">{b}</p></div>)}</section>))}</main>);
}
