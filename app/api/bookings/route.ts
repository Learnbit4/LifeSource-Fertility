import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { and, between, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { isBookable } from "@/lib/booking";
import { TERMS_VERSION } from "@/lib/terms";
import { normalizePhone } from "@/lib/server/mpesa";
import { clientIp, dupEntry, limited, makeRef } from "@/lib/server/util";
import { getSession, sameOrigin } from "@/lib/server/auth";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const Body = z.object({ service: z.enum(["IUI", "IVF"]), date: z.string(), time: z.string(), name: z.string().trim().min(2).max(120),
  phone: z.string().max(20), email: z.string().trim().email().max(160), termsVersion: z.string() });
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const session = await getSession(); if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (limited("book:" + clientIp(req), 6, 10 * 60_000)) return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const b = p.data;
  if (b.termsVersion !== TERMS_VERSION) return NextResponse.json({ error: "terms_outdated" }, { status: 409 });
  if (!isBookable(b.date, b.time)) return NextResponse.json({ error: "slot_unavailable" }, { status: 400 });
  const phone = normalizePhone(b.phone); if (!phone) return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  const reference = makeRef("BK");
  try {
    await db.insert(bookings).values({ id: randomUUID(), userId: session.user.id, reference, service: b.service, slotDate: b.date, slotTime: b.time, activeSlot: `${b.date}T${b.time}`, name: b.name, phone, email: b.email, termsVersion: b.termsVersion });
  } catch (e) { if (dupEntry(e)) return NextResponse.json({ error: "slot_taken" }, { status: 409 }); throw e; }
  return NextResponse.json({ reference }, { status: 201 });
}
// Taken slots only: no personal data.
export async function GET(req: Request) {
  const u = new URL(req.url); const from = u.searchParams.get("from") ?? "", to = u.searchParams.get("to") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return NextResponse.json({ error: "invalid_range" }, { status: 400 });
  const rows = await db.select({ d: bookings.slotDate, t: bookings.slotTime }).from(bookings).where(and(isNotNull(bookings.activeSlot), between(bookings.slotDate, from, to)));
  return NextResponse.json({ taken: rows.map((r) => `${r.d}T${r.t}`) });
}
