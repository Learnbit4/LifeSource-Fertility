import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { isMock, normalizePhone, stkPush } from "@/lib/server/mpesa";
import { handleStkCallback } from "@/lib/server/payments";
import { clientIp, limited } from "@/lib/server/util";
import { getSession, sameOrigin } from "@/lib/server/auth";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const Body = z.object({ orderId: z.string().uuid(), phone: z.string().max(20) });
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const session = await getSession(); if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (limited("stk:" + clientIp(req), 8, 10 * 60_000)) return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  const [o] = await db.select().from(orders).where(eq(orders.id, parsed.data.orderId));
  if (!o || o.userId !== session.user.id) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (o.status !== "PENDING" || o.expiresAt < new Date()) return NextResponse.json({ error: "order_not_payable", status: o.status }, { status: 409 });
  const [{ n }] = await db.select({ n: count() }).from(payments).where(eq(payments.orderId, o.id));
  if (n >= 5) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  const [last] = await db.select().from(payments).where(eq(payments.orderId, o.id)).orderBy(desc(payments.id)).limit(1);
  if (last?.status === "INITIATED" && Date.now() - last.createdAt.getTime() < 90_000) return NextResponse.json({ error: "payment_in_progress" }, { status: 409 });
  const secret = process.env.MPESA_CALLBACK_SECRET; const base = process.env.MPESA_CALLBACK_BASE_URL;
  if (!secret || !base) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
  // Amount comes from the order row (server-calculated). Insert first so a fast callback always finds its payment.
  const placeholder = "pending-" + randomUUID();
  await db.insert(payments).values({ orderId: o.id, checkoutRequestId: placeholder, phone, amountKes: o.kesAmount });
  try {
    const r = isMock() ? { merchantRequestId: "mock", checkoutRequestId: "mock-" + randomUUID() }
      : await stkPush({ phone, amount: o.kesAmount, reference: o.reference, callbackUrl: `${base}/api/pay/callback?token=${secret}` });
    await db.update(payments).set({ checkoutRequestId: r.checkoutRequestId, merchantRequestId: r.merchantRequestId }).where(eq(payments.checkoutRequestId, placeholder));
    if (isMock()) setTimeout(() => handleStkCallback({ CheckoutRequestID: r.checkoutRequestId, ResultCode: 0, ResultDesc: "The service request is processed successfully.",
      CallbackMetadata: { Item: [{ Name: "Amount", Value: o.kesAmount }, { Name: "MpesaReceiptNumber", Value: "MOCK" + randomUUID().slice(0, 6).toUpperCase() }, { Name: "PhoneNumber", Value: Number(phone) }] } }).catch(console.error), 4000);
    return NextResponse.json({ ok: true, message: "Check your phone and enter your M-Pesa PIN." });
  } catch (e) {
    await db.update(payments).set({ status: "FAILED", resultDesc: String((e as Error).message).slice(0, 255) }).where(and(eq(payments.checkoutRequestId, placeholder)));
    console.error("STK push failed", e);
    return NextResponse.json({ error: "stk_failed" }, { status: 502 });
  }
}
