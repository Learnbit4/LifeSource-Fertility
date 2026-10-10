// Staff tool. Usage:  npm run user -- verify someone@example.com   |   npm run user -- role someone@example.com CLINIC
import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
(async () => {
  const [cmd, email, role] = process.argv.slice(2);
  const conn = await mysql.createConnection(process.env.DATABASE_URL!); const db = drizzle(conn);
  const e = (email ?? "").toLowerCase(); let msg = "Usage: verify <email> | role <email> RECIPIENT|CLINIC|ADMIN";
  if (cmd === "verify" && e) { const [r] = await db.update(users).set({ verifiedAt: new Date() }).where(eq(users.email, e)); msg = r.affectedRows ? `Verified ${e}` : "No such user"; }
  if (cmd === "role" && e && ["RECIPIENT", "CLINIC", "ADMIN"].includes(role)) { const [r] = await db.update(users).set({ role: role as "ADMIN" }).where(eq(users.email, e)); msg = r.affectedRows ? `${e} is now ${role}` : "No such user"; }
  console.log(msg); await conn.end();
})();
