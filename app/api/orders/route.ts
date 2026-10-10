import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { donors, orderItems, orders } from "@/db/schema";
import { priceFor, kesFromUsd, USD_TO_KES } from "@/lib/pricing";
import { TERMS_VERSION } from "@/lib/terms";
import { normalizePhone } from "@/lib/server/mpesa";
import { expireStaleOrders, reserve, OutOfStock } from "@/lib/server/orders";
import { clientIp, limited, makeRef } from "@/lib/server/util";
import { getSession, sameOrigin } from "@/lib/server/auth";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const HOLD_MS = 15 * 60_000;
const Body = z.object({
  buyer: z.object({ name: z.string().trim().min(2).max(120), phone: z.string().max(20), email: z.string().trim().email().max(160) }),
  items: z.array(z.object({ donorId: z.string().max(16), vial: z.enum(["MOT10", "MOT20"]), processing: z.enum(["ICI", "IUI"]), qty: z.number().int().min(1).max(10) })).min(1).max(10),
  termsVersion: z.string(),
});
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const session = await getSession(); if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (limited("order:" + clientIp(req), 10, 10 * 60_000)) return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
  const { buyer, items, termsVersion } = parsed.data;
  if (termsVersion !== TERMS_VERSION) return NextResponse.json({ error: "terms_outdated" }, { status: 409 });
  const phone = normalizePhone(buyer.phone);
  if (!phone) return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  // Merge duplicate lines, then price everything from the server's own tables. Client prices are never trusted.
  const merged = new Map<string, (typeof items)[0]>();
  for (const i of items) { const k = `${i.donorId}|${i.vial}|${i.processing}`; const m = merged.get(k); merged.set(k, m ? { ...m, qty: m.qty + i.qty } : i); }
  const lines = [...merged.values()];
  await expireStaleOrders();
  const found = await db.select().from(donors).where(inArray(donors.id, [...new Set(lines.map((l) => l.donorId))]));
  const tier = new Map(found.map((d) => [d.id, d.tier]));
  if (lines.some((l) => !tier.has(l.donorId))) return NextResponse.json({ error: "unknown_donor" }, { status: 400 });
  const priced = lines.map((l) => ({ ...l, unitUsd: priceFor(tier.get(l.donorId)!, l.vial, l.processing) }));
  if (priced.some((l) => l.qty > 10)) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const usdTotal = priced.reduce((a, l) => a + l.unitUsd * l.qty, 0); const kesAmount = kesFromUsd(usdTotal);
  const id = randomUUID(); const reference = makeRef("SS"); const expiresAt = new Date(Date.now() + HOLD_MS);
  try {
    await db.transaction(async (tx) => {
      await tx.insert(orders).values({ id, reference, userId: session.user.id, buyerName: buyer.name, buyerPhone: phone, buyerEmail: buyer.email, usdTotal, kesAmount, usdToKesRate: String(USD_TO_KES), termsVersion, expiresAt });
      for (const l of priced) { await reserve(tx, l.donorId, l.vial, l.qty); await tx.insert(orderItems).values({ orderId: id, donorId: l.donorId, vial: l.vial, processing: l.processing, qty: l.qty, unitUsd: l.unitUsd }); }
    });
  } catch (e) { if (e instanceof OutOfStock) return NextResponse.json({ error: "out_of_stock", donorId: e.donorId }, { status: 409 }); throw e; }
  return NextResponse.json({ orderId: id, reference, usdTotal, kesAmount, rate: USD_TO_KES, expiresAt, items: priced }, { status: 201 });
}
