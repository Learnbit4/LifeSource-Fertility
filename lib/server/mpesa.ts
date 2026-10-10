// Safaricom Daraja STK Push client. Server-only: never import from client components.
const BASE = process.env.MPESA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
export const isMock = () => process.env.MPESA_MOCK === "1" && process.env.NODE_ENV !== "production";
export function normalizePhone(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(d)) return "254" + d.slice(1);
  if (/^254[17]\d{8}$/.test(d)) return d;
  if (/^[17]\d{8}$/.test(d)) return "254" + d;
  return null;
}
let cached: { token: string; exp: number } | null = null;
async function token() {
  if (cached && cached.exp > Date.now() + 30_000) return cached.token;
  const { MPESA_CONSUMER_KEY: k, MPESA_CONSUMER_SECRET: s } = process.env;
  if (!k || !s) throw new Error("M-Pesa consumer key/secret not configured");
  const r = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: "Basic " + Buffer.from(`${k}:${s}`).toString("base64") }, signal: AbortSignal.timeout(20_000) });
  if (!r.ok) throw new Error(`Daraja auth failed (${r.status})`);
  const j = (await r.json()) as { access_token: string; expires_in: string };
  cached = { token: j.access_token, exp: Date.now() + Number(j.expires_in) * 1000 };
  return cached.token;
}
export type StkResult = { merchantRequestId: string; checkoutRequestId: string };
export async function stkPush(a: { phone: string; amount: number; reference: string; callbackUrl: string }): Promise<StkResult> {
  const { MPESA_SHORTCODE: code, MPESA_PASSKEY: pass } = process.env;
  if (!code || !pass) throw new Error("M-Pesa shortcode/passkey not configured");
  const ts = new Date(Date.now() + 3 * 3600_000).toISOString().replace(/\D/g, "").slice(0, 14);
  const r = await fetch(`${BASE}/mpesa/stkpush/v1/processrequest`, {
    method: "POST", signal: AbortSignal.timeout(20_000),
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ BusinessShortCode: code, Password: Buffer.from(code + pass + ts).toString("base64"), Timestamp: ts,
      TransactionType: process.env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline", Amount: a.amount, PartyA: a.phone,
      PartyB: process.env.MPESA_PARTY_B || code, PhoneNumber: a.phone, CallBackURL: a.callbackUrl, AccountReference: a.reference.slice(0, 12), TransactionDesc: "Supsperm" }),
  });
  const j = (await r.json().catch(() => ({}))) as { ResponseCode?: string; CheckoutRequestID?: string; MerchantRequestID?: string; errorMessage?: string; ResponseDescription?: string };
  if (!r.ok || j.ResponseCode !== "0" || !j.CheckoutRequestID) throw new Error(j.errorMessage || j.ResponseDescription || `STK push rejected (${r.status})`);
  return { merchantRequestId: j.MerchantRequestID ?? "", checkoutRequestId: j.CheckoutRequestID };
}
