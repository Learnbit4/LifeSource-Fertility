import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { expireStaleOrders } from "@/lib/server/orders";
import { getSession } from "@/lib/server/auth";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
// Order ids are unguessable UUIDs. Response deliberately contains no personal data.
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await getSession(); if (!s) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  await expireStaleOrders();
  const [o] = await db.select().from(orders).where(eq(orders.id, params.id));
  if (!o || (o.userId !== s.user.id && s.user.role !== "ADMIN")) return NextResponse.json({ error: "not_found" }, { status: 404 }); // same answer for "missing" and "not yours"
  const [p] = await db.select().from(payments).where(eq(payments.orderId, o.id)).orderBy(desc(payments.id)).limit(1);
  return NextResponse.json({ reference: o.reference, status: o.status, usdTotal: o.usdTotal, kesAmount: o.kesAmount, rate: o.usdToKesRate, expiresAt: o.expiresAt,
    payment: p ? { status: p.status, resultDesc: p.resultDesc, receipt: p.status === "SUCCESS" ? p.mpesaReceipt : null } : null });
}
