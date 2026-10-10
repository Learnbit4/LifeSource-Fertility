import { randomBytes, scrypt as _scrypt, createHash, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number, o: object) => Promise<Buffer>;
const N = 65536, R = 8, P = 1, LEN = 64, MAXMEM = 256 * 1024 * 1024;
export const hashPassword = async (pw: string) => { const salt = randomBytes(16); const h = await scrypt(pw, salt, LEN, { N, r: R, p: P, maxmem: MAXMEM });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${h.toString("base64")}`; };
export async function verifyPassword(pw: string, stored: string) {
  const [alg, n, r, p, s, h] = stored.split("$"); if (alg !== "scrypt") return false;
  const exp = Buffer.from(h, "base64"); const got = await scrypt(pw, Buffer.from(s, "base64"), exp.length, { N: +n, r: +r, p: +p, maxmem: MAXMEM });
  return got.length === exp.length && timingSafeEqual(got, exp);
}
let dummy: Promise<string> | null = null; // burned on unknown emails so response time doesn't reveal which accounts exist
export const dummyHash = () => (dummy ??= hashPassword("not-a-real-password"));
const COOKIE = "ss_session", DAYS = 14;
const sha = (t: string) => createHash("sha256").update(t).digest("hex");
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url"); const expiresAt = new Date(Date.now() + DAYS * 86400_000);
  await db.insert(sessions).values({ id: sha(token), userId, expiresAt });
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}
export type SessionUser = { id: string; email: string; name: string; phone: string; role: "RECIPIENT" | "CLINIC" | "ADMIN"; verified: boolean };
export async function getSession(): Promise<{ user: SessionUser } | null> {
  const token = cookies().get(COOKIE)?.value; if (!token) return null;
  const [row] = await db.select({ u: users }).from(sessions).innerJoin(users, eq(users.id, sessions.userId)).where(and(eq(sessions.id, sha(token)), gt(sessions.expiresAt, new Date()))).limit(1);
  if (!row) return null; const u = row.u;
  return { user: { id: u.id, email: u.email, name: u.name, phone: u.phone, role: u.role, verified: !!u.verifiedAt } };
}
export async function destroySession() {
  const token = cookies().get(COOKIE)?.value; if (token) await db.delete(sessions).where(eq(sessions.id, sha(token)));
  cookies().delete(COOKIE);
}
// CSRF defence on top of SameSite=Lax: state-changing browser requests must come from our own origin.
export function sameOrigin(req: Request) {
  const o = req.headers.get("origin"); if (!o) return process.env.NODE_ENV !== "production"; // curl/tests only outside production
  try { return new URL(o).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host")); } catch { return false; }
}
