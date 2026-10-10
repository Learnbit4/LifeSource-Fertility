// SINGLE SOURCE OF TRUTH FOR PRICES. Edit only this file (plus each donor's `tier` in lib/donors.ts).
// ALL VALUES BELOW ARE PLACEHOLDERS: replace with real prices, then set PRICES_CONFIRMED = true.
export const PRICES_CONFIRMED = true;
export const CURRENCY = "USD";
// Exchange rate is a PLACEHOLDER: update manually (or wire to a rate API server-side). USD is the base currency.
export const USD_TO_KES = 129;
// The KES amount actually charged via M-Pesa. M-Pesa takes whole shillings; we round to the nearest 100 so displayed and charged amounts match.
export const kesFromUsd = (usd: number) => Math.round((usd * USD_TO_KES) / 100) * 100;
export const DONOR_REGISTRATION_FEE = 20;
export const DONOR_FEE_COVERS = "Covers identity verification and eligibility checks.";

export type Processing = "ICI" | "IUI";
export type VialType = "MOT10" | "MOT20";
export type Tier = "STANDARD" | "PREMIUM";

export const TIER_LABEL: Record<Tier, string> = { STANDARD: "Standard", PREMIUM: "Premium" };
export const PROCESSING_INFO: Record<Processing, { label: string; blurb: string }> = {
  ICI: { label: "ICI (unwashed)", blurb: "For at-home or intracervical insemination." },
  IUI: { label: "IUI (washed)", blurb: "Prepared for clinic intrauterine insemination." },
};
export const VIAL_INFO: Record<VialType, { label: string; blurb: string }> = {
  MOT10: { label: "MOT10", blurb: "Approx. 10 million motile sperm per vial after thaw." },
  MOT20: { label: "MOT20", blurb: "Approx. 20 million motile sperm per vial after thaw." },
};
export const VIAL_PRICES: Record<Tier, Record<VialType, Record<Processing, number>>> = {
  STANDARD: { MOT10: { ICI: 550, IUI: 750 }, MOT20: { ICI: 750, IUI: 950 } },
  PREMIUM:  { MOT10: { ICI: 750, IUI: 950 }, MOT20: { ICI: 950, IUI: 1050 } },
};
// Clinic procedure fees: PLACEHOLDERS. Confirm whether Supsperm performs these or refers to partner clinics.
export const CLINIC_FEES = [
  { id: "IUI", label: "IUI procedure", blurb: "Intrauterine insemination, per cycle.", price: 250 },
  { id: "IVF", label: "IVF cycle", blurb: "In vitro fertilisation, per cycle.", price: 2500 },
];
export const priceFor = (t: Tier, v: VialType, p: Processing) => VIAL_PRICES[t][v][p];
export const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 }).format(n);
