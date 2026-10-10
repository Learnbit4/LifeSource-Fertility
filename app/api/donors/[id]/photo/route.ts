import { NextResponse } from "next/server";
import { DONORS } from "@/lib/donors";
import { getSession } from "@/lib/server/auth";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
// The real gate: the image bytes exist only in this response, and only for a logged-in, staff-verified account.
// Placeholder SVG for now; replace the body with a signed read from private storage (e.g. S3) once real photos exist.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const s = await getSession(); if (!s) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!s.user.verified) return NextResponse.json({ error: "verification_required" }, { status: 403 });
  const d = DONORS.find((x) => x.id === params.id); if (!d) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const view = new URL(req.url).searchParams.get("view") === "child" ? "child" : "adult";
  if (view === "child" && !d.hasChildPhoto) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#13827F"/><stop offset="1" stop-color="#0B2545"/></linearGradient></defs><rect width="320" height="400" fill="url(#g)"/><text x="160" y="190" fill="#FAF7F2" font-family="sans-serif" font-size="20" text-anchor="middle">${d.code}</text><text x="160" y="220" fill="#FAF7F2" font-family="sans-serif" font-size="14" text-anchor="middle">${view} photo (placeholder)</text></svg>`;
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "private, no-store", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'" } });
}
