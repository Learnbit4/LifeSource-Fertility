import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/auth";
import TermsGate from "@/components/TermsGate";
import OrderSummary from "@/components/OrderSummary";
export const metadata = { title: "Reserve vials" };
export default async function Page() {
  if (!(await getSession())) redirect("/login?next=/checkout");
  return (<main className="mx-auto max-w-3xl px-6 py-16"><h1 className="mb-8 font-display text-4xl text-navy">Reserve vials</h1>
    <TermsGate kind="buyer"><OrderSummary /></TermsGate></main>);
}
