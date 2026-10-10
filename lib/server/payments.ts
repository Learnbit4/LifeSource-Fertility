import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
export type StkCallback = { MerchantRequestID?: string; CheckoutRequestID: string; ResultCode: number | string; ResultDesc: string;
  CallbackMetadata?: { Item: { Name: string; Value?: string | number }[] } };
// Idempotent: a repeated callback for the same payment does nothing.
export async function handleStkCallback(cb: StkCallback) {
  const meta = (n: string) => cb.CallbackMetadata?.Item.find((i) => i.Name === n)?.Value;
  const code = Number(cb.ResultCode);
  await db.transaction(async (tx) => {
    const [p] = await tx.select().from(payments).where(eq(payments.checkoutRequestId, cb.CheckoutRequestID)).for("update");
    if (!p || p.status !== "INITIATED") return;
    const ok = code === 0;
    await tx.update(payments).set({ status: ok ? "SUCCESS" : code === 1032 ? "CANCELLED" : "FAILED", resultCode: code, resultDesc: String(cb.ResultDesc).slice(0, 255),
      mpesaReceipt: ok ? String(meta("MpesaReceiptNumber") ?? "") || null : null, rawCallback: JSON.stringify(cb) }).where(eq(payments.id, p.id));
    if (!ok) return; // order stays PENDING so the buyer can retry until the hold expires
    const [o] = await tx.select().from(orders).where(eq(orders.id, p.orderId)).for("update");
    const notes: string[] = []; const paid = Number(meta("Amount"));
    if (!(paid >= p.amountKes)) { // underpayment (or missing amount): never mark paid; flag for a human
      await tx.update(orders).set({ needsReview: true, reviewNote: `Underpayment: paid ${meta("Amount")}, expected ${p.amountKes}`.slice(0, 255) }).where(eq(orders.id, o.id)); return; }
    if (paid > p.amountKes) notes.push(`Overpayment: paid ${paid}, expected ${p.amountKes}: refund difference`);
    if (o.status === "PAID") notes.push("Duplicate payment on an already paid order: refund needed");
    else if (o.status !== "PENDING") notes.push(`Paid while order was ${o.status}: stock may have been released`);
    await tx.update(orders).set({ status: "PAID", paidAt: o.paidAt ?? new Date(), ...(notes.length ? { needsReview: true, reviewNote: notes.join("; ").slice(0, 255) } : {}) }).where(eq(orders.id, o.id));
  });
}
