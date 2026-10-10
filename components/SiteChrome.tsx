import Link from "next/link";
import Wordmark from "./Wordmark";
import { SITE } from "@/lib/site";
import CurrencyToggle from "./CurrencyToggle";
import AuthNav from "./AuthNav";
const nav = [["Donors", "/donors"], ["Pricing", "/#pricing"], ["Become a donor", "/become-a-donor"], ["Reserve vials", "/checkout"], ["Book clinic", "/book"], ["Contact", "/contact"]];
export function Header() {
  return (<header className="sticky top-0 z-20 border-b border-navy/10 bg-paper/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
    <Link href="/" aria-label="Supsperm home" className="text-navy"><Wordmark /></Link>
    <nav aria-label="Main" className="flex flex-wrap gap-x-5 gap-y-1 text-sm">{nav.map(([l, h]) => <Link key={h} href={h} className="text-ink/80 hover:text-teal">{l}</Link>)}<CurrencyToggle /><AuthNav /></nav></div></header>);
}
export function Footer() {
  return (<footer className="mt-16 bg-navy px-6 py-10 text-sm text-paper/80"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-6">
    <div><p className="font-display text-lg text-paper">{SITE.name}</p><p>{SITE.street}, {SITE.city}, {SITE.countryName}</p><p>{SITE.phone} · {SITE.email}</p></div>
    <div className="space-x-4"><Link href="/terms" className="underline">Terms</Link><Link href="/contact" className="underline">Contact</Link></div>
    <p className="w-full text-xs text-paper/50">© {new Date().getFullYear()} {SITE.name}. {SITE.licence}</p></div></footer>);
}
