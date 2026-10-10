import { randomBytes } from "node:crypto";
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const makeRef = (prefix: string) => prefix + "-" + [...randomBytes(6)].map((b) => ALPHA[b % ALPHA.length]).join("");
export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
// In-memory limiter: fine for one server process; use Redis or the database once you run several instances.
const hits = new Map<string, number[]>();
export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now(); const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(key, arr); return arr.length > max;
}
export const dupEntry = (e: unknown) => { const x = e as { code?: string; cause?: { code?: string } }; return x?.code === "ER_DUP_ENTRY" || x?.cause?.code === "ER_DUP_ENTRY"; };
