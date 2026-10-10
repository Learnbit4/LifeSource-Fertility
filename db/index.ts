import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
const g = globalThis as unknown as { __pool?: mysql.Pool };
const pool = g.__pool ?? mysql.createPool({ uri: process.env.DATABASE_URL!, timezone: "Z", connectionLimit: 10 });
if (process.env.NODE_ENV !== "production") g.__pool = pool;
export const db = drizzle(pool, { schema, mode: "default" });
