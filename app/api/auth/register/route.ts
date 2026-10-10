import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword, sameOrigin } from "@/lib/server/auth";
import { normalizePhone } from "@/lib/server/mpesa";
import { clientIp, dupEntry, limited } from "@/lib/server/util";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const Body = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().toLowerCase().email().max(160), phone: z.string().max(20), password: z.string().min(10).max(128) });
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (limited("reg:" + clientIp(req), 5, 60 * 60_000)) return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid_request", fields: Object.keys(p.error.flatten().fieldErrors) }, { status: 400 });
  const phone = normalizePhone(p.data.phone); if (!phone) return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  if (p.data.password.toLowerCase().includes(p.data.email.split("@")[0])) return NextResponse.json({ error: "weak_password" }, { status: 400 });
  const id = randomUUID();
  try { await db.insert(users).values({ id, email: p.data.email, name: p.data.name, phone, passwordHash: await hashPassword(p.data.password) }); }
  catch (e) { if (dupEntry(e)) return NextResponse.json({ error: "email_taken" }, { status: 409 }); throw e; }
  await createSession(id);
  return NextResponse.json({ ok: true }, { status: 201 });
}
