import { create } from "zustand";
import { TERMS_VERSION, type Kind } from "@/lib/terms";
// MOCK: real implementation must save version + timestamp + user id server-side.
type S = { accepted: Partial<Record<Kind, { version: string; at: string }>>; accept: (k: Kind) => void };
export const useConsentStore = create<S>((set) => ({ accepted: {},
  accept: (k) => set((s) => ({ accepted: { ...s.accepted, [k]: { version: TERMS_VERSION, at: new Date().toISOString() } } })) }));
