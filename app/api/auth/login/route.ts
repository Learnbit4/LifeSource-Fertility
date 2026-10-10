import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, dummyHash, sameOrigin, verifyPassword } from "@/lib/server/auth";
import { clientIp, limited } from "@/lib/server/util";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const Body = z.object({ email: z.string().trim().toLowerCase().max(160), password: z.string().max(128) });
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const ip = clientIp(req);
  if (limited("login-ip:" + ip, 20, 10 * 60_000) || limited(`login:${ip}:${p.data.email}`, 5, 10 * 60_000)) return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  const [u] = await db.select().from(users).where(eq(users.email, p.data.email));
  const ok = await verifyPassword(p.data.password, u?.passwordHash ?? (await dummyHash()));
  if (!u || !ok) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  await createSession(u.id);
  return NextResponse.json({ ok: true });
}
