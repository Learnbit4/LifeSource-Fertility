import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/auth";
import TermsGate from "@/components/TermsGate";
import BookingWizard from "@/components/BookingWizard";
export const metadata = { title: "Book an IUI or IVF appointment" };
export default async function Page() {
  if (!(await getSession())) redirect("/login?next=/book");
  return (<main className="mx-auto max-w-2xl px-6 py-16"><h1 className="mb-8 font-display text-4xl text-navy">Book at our clinic</h1>
    <TermsGate kind="buyer"><BookingWizard /></TermsGate></main>);
}
