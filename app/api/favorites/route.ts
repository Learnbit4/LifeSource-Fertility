import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { donors, favorites } from "@/db/schema";
import { getSession, sameOrigin } from "@/lib/server/auth";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const Body = z.object({ donorId: z.string().max(16), on: z.boolean() });
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const s = await getSession(); if (!s) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const p = Body.safeParse(await req.json().catch(() => null)); if (!p.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const [d] = await db.select({ id: donors.id }).from(donors).where(eq(donors.id, p.data.donorId)); if (!d) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (p.data.on) await db.insert(favorites).values({ userId: s.user.id, donorId: d.id }).onDuplicateKeyUpdate({ set: { donorId: d.id } });
  else await db.delete(favorites).where(and(eq(favorites.userId, s.user.id), eq(favorites.donorId, d.id)));
  return NextResponse.json({ ok: true });
}
