import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { handleStkCallback, type StkCallback } from "@/lib/server/payments";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
// Safaricom does not sign callbacks, so this URL carries a secret token. The handler also checks amount and idempotency.
export async function POST(req: Request) {
  const secret = process.env.MPESA_CALLBACK_SECRET;
  if (!secret) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
  const given = new URL(req.url).searchParams.get("token") ?? "";
  const a = Buffer.from(given), b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { Body?: { stkCallback?: StkCallback } } | null;
  const cb = body?.Body?.stkCallback;
  if (!cb?.CheckoutRequestID) return NextResponse.json({ error: "bad_payload" }, { status: 400 });
  try { await handleStkCallback(cb); } catch (e) { console.error("callback error", e); return NextResponse.json({ error: "server_error" }, { status: 500 }); }
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
