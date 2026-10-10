import { create } from "zustand";
import type { VialType, Processing } from "@/lib/pricing";
// MOCK STATE ONLY: real app must keep cart, account and bookings server-side and recompute prices there.
export type CartItem = { donorId: string; vial: VialType; processing: Processing; qty: number };
export const useCartStore = create<{ items: CartItem[]; add: (i: CartItem) => void; remove: (idx: number) => void; clear: () => void }>((set) => ({
  items: [],
  add: (i) => set((s) => { const k = s.items.findIndex((x) => x.donorId === i.donorId && x.vial === i.vial && x.processing === i.processing);
    if (k < 0) return { items: [...s.items, i] };
    const items = [...s.items]; items[k] = { ...items[k], qty: items[k].qty + i.qty }; return { items }; }),
  remove: (idx) => set((s) => ({ items: s.items.filter((_, k) => k !== idx) })),
  clear: () => set({ items: [] }),
}));
export type Service = "IUI" | "IVF";
export const useBookingStore = create<{ service: Service; setService: (s: Service) => void; reference: string | null; setReference: (r: string | null) => void }>((set) => ({
  service: "IUI", setService: (service) => set({ service }), reference: null, setReference: (reference) => set({ reference }),
}));
