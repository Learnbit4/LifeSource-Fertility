import { SITE, MAP_QUERY } from "@/lib/site";
export const metadata = { title: "Contact and location" };
export default function Page() {
  return (<main className="mx-auto max-w-5xl px-6 py-16"><h1 className="font-display text-4xl text-navy">Contact us</h1>
    <div className="mt-8 grid gap-8 md:grid-cols-2"><address className="not-italic space-y-2">
      <p className="font-semibold">{SITE.name} head office</p><p>{SITE.street}<br />{SITE.city}, {SITE.countryName}</p>
      <p>Phone: <a className="text-teal underline" href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a></p>
      <p>Email: <a className="text-teal underline" href={`mailto:${SITE.email}`}>{SITE.email}</a></p><p>{SITE.hours}</p></address>
      <iframe title="Supsperm office location in Nairobi, Kenya" loading="lazy" className="h-80 w-full rounded-xl border-0"
        src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`} /></div></main>);
}
