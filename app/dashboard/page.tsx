import { redirect } from "next/navigation";
import Link from "next/link";
import { and, desc, eq, gte, inArray, isNotNull, asc } from "drizzle-orm";
import { db } from "@/db";
import { bookings, favorites, orderItems, orders } from "@/db/schema";
import { getSession } from "@/lib/server/auth";
import { DONORS } from "@/lib/donors";
import { todayEAT } from "@/lib/booking";
import FavoriteButton from "@/components/FavoriteButton";
export const metadata = { title: "Dashboard" };
const kes = (n: number) => `KSh ${n.toLocaleString("en-KE")}`;
const Card = ({ t, children }: { t: string; children: React.ReactNode }) => <section className="rounded-2xl border border-navy/10 bg-white p-6"><h2 className="font-display text-xl text-navy">{t}</h2><div className="mt-3 space-y-2 text-sm">{children}</div></section>;
export default async function Dashboard() {
  const s = await getSession(); if (!s) redirect("/login?next=/dashboard"); const u = s.user;
  const myOrders = await db.select().from(orders).where(eq(orders.userId, u.id)).orderBy(desc(orders.createdAt)).limit(20);
  const items = myOrders.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, myOrders.map((o) => o.id))) : [];
  const myBookings = await db.select().from(bookings).where(eq(bookings.userId, u.id)).orderBy(desc(bookings.slotDate)).limit(20);
  const favs = await db.select({ id: favorites.donorId }).from(favorites).where(eq(favorites.userId, u.id));
  const clinic = u.role === "CLINIC" || u.role === "ADMIN";
  const upcoming = clinic ? await db.select().from(bookings).where(and(isNotNull(bookings.activeSlot), gte(bookings.slotDate, todayEAT()))).orderBy(asc(bookings.slotDate), asc(bookings.slotTime)).limit(50) : [];
  return (<main className="mx-auto max-w-5xl space-y-6 px-6 py-12">
    <div><h1 className="font-display text-4xl text-navy">Hello, {u.name.split(" ")[0]}</h1>
      <p className="text-sm text-ink/60">{u.email} · {u.verified ? "Verified account: donor photos unlocked" : "Account awaiting verification by our team (needed to view donor photos)"}</p></div>
    {clinic && <Card t="Clinic: upcoming bookings">{upcoming.length ? upcoming.map((b) => <p key={b.id} className="flex flex-wrap justify-between gap-2 border-t border-navy/10 pt-2"><span><b>{b.slotDate} {b.slotTime}</b> · {b.service} · {b.name}</span><span className="text-ink/60">{b.phone} · {b.email} · {b.reference}</span></p>) : <p className="text-ink/60">No upcoming bookings.</p>}</Card>}
    <Card t="Saved donors">{favs.length ? favs.map((f) => { const d = DONORS.find((x) => x.id === f.id); return d ? <p key={f.id} className="flex items-center justify-between border-t border-navy/10 pt-2"><Link href={`/donors/${d.id}`} className="text-teal underline">{d.code}</Link><FavoriteButton donorId={d.id} /></p> : null; }) : <p className="text-ink/60">None yet. Tap the heart on a donor to save them. <Link href="/donors" className="text-teal underline">Browse donors</Link></p>}</Card>
    <Card t="Your orders">{myOrders.length ? myOrders.map((o) => <p key={o.id} className="flex flex-wrap justify-between gap-2 border-t border-navy/10 pt-2"><span><b>{o.reference}</b> · {o.createdAt.toISOString().slice(0, 10)} · {items.filter((i) => i.orderId === o.id).reduce((a, i) => a + i.qty, 0)} vial(s)</span><span>{kes(o.kesAmount)} · <b className={o.status === "PAID" ? "text-teal" : ""}>{o.status}</b>{o.needsReview ? " · under review" : ""}</span></p>) : <p className="text-ink/60">No orders yet.</p>}</Card>
    <Card t="Your clinic bookings">{myBookings.length ? myBookings.map((b) => <p key={b.id} className="flex flex-wrap justify-between gap-2 border-t border-navy/10 pt-2"><span><b>{b.reference}</b> · {b.service}</span><span>{b.slotDate} {b.slotTime} EAT · {b.status}</span></p>) : <p className="text-ink/60">No bookings. <Link href="/book" className="text-teal underline">Book at our clinic</Link></p>}</Card>
    <p className="text-xs text-ink/50">Delivery tracking map and secure messaging are not built yet.</p></main>);
}
