import { NextResponse } from "next/server";
import { destroySession, sameOrigin } from "@/lib/server/auth";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await destroySession(); return NextResponse.json({ ok: true });
}
