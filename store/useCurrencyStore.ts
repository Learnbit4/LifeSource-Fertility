import { create } from "zustand";
import { kesFromUsd } from "@/lib/pricing";
export type Cur = "USD" | "KES";
export const useCurrencyStore = create<{ cur: Cur; set: (c: Cur) => void }>((set) => ({ cur: "USD", set: (cur) => set({ cur }) }));
export const formatMoney = (usd: number, cur: Cur) => cur === "USD"
  ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(usd)
  : "KSh " + new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(kesFromUsd(usd));
export const useMoney = () => { const cur = useCurrencyStore((s) => s.cur); return (n: number) => formatMoney(n, cur); };
