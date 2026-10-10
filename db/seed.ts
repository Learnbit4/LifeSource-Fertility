import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { donors } from "./schema";
import { DONORS } from "../lib/donors";
(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(conn);
  // Inserts new donors only; never overwrites live stock.
  for (const d of DONORS) await db.insert(donors).values({ id: d.id, code: d.code, tier: d.tier, mot10Stock: d.mot10, mot20Stock: d.mot20 }).onDuplicateKeyUpdate({ set: { code: d.code, tier: d.tier } });
  console.log(`Seeded ${DONORS.length} donors`); await conn.end();
})();
