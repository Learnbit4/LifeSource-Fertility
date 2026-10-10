import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { getSession } from "@/lib/server/auth";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET() {
  const s = await getSession(); if (!s) return NextResponse.json({ user: null, favorites: [] });
  const f = await db.select({ id: favorites.donorId }).from(favorites).where(eq(favorites.userId, s.user.id));
  return NextResponse.json({ user: s.user, favorites: f.map((x) => x.id) });
}
