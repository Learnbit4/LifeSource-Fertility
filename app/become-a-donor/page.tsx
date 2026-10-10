import TermsGate from "@/components/TermsGate";
import { DONOR_REGISTRATION_FEE, DONOR_FEE_COVERS } from "@/lib/pricing";
import Price from "@/components/Price";
export const metadata = { title: "Become a donor" };
export default function Page() {
  return (<main className="mx-auto max-w-5xl px-6 py-16"><h1 className="mb-8 font-display text-4xl text-navy">Become a donor</h1>
    <TermsGate kind="donor"><div className="rounded-xl bg-white p-6">
      <p>Registration fee: <b><Price usd={DONOR_REGISTRATION_FEE} /></b>. {DONOR_FEE_COVERS}</p>
      <p className="mt-2 text-ink/60">Screening wizard (eligibility, family history, compensation) is built in the next step.</p></div></TermsGate></main>);
}
