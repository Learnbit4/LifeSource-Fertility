import { and, eq, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { donors, orderItems, orders } from "@/db/schema";
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
const col = (v: "MOT10" | "MOT20") => (v === "MOT10" ? donors.mot10Stock : donors.mot20Stock);
const colKey = (v: "MOT10" | "MOT20") => (v === "MOT10" ? "mot10Stock" : "mot20Stock") as "mot10Stock" | "mot20Stock";
export class OutOfStock extends Error { constructor(public donorId: string) { super("out_of_stock"); } }
export async function reserve(tx: Tx, donorId: string, vial: "MOT10" | "MOT20", qty: number) {
  const [r] = await tx.update(donors).set({ [colKey(vial)]: sql`${col(vial)} - ${qty}` }).where(and(eq(donors.id, donorId), sql`${col(vial)} >= ${qty}`));
  if (r.affectedRows !== 1) throw new OutOfStock(donorId);
}
async function release(tx: Tx, orderId: string) {
  const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const i of items) await tx.update(donors).set({ [colKey(i.vial)]: sql`${col(i.vial)} + ${i.qty}` }).where(eq(donors.id, i.donorId));
}
// Lazy expiry: releases stock held by unpaid orders past their hold time. Call before reading stock or order status.
export async function expireStaleOrders() {
  const stale = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.status, "PENDING"), lt(orders.expiresAt, new Date())));
  for (const s of stale) await db.transaction(async (tx) => {
    const [r] = await tx.update(orders).set({ status: "EXPIRED" }).where(and(eq(orders.id, s.id), eq(orders.status, "PENDING")));
    if (r.affectedRows === 1) await release(tx, s.id);
  });
}
