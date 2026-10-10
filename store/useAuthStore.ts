import { create } from "zustand";
export type AuthUser = { id: string; email: string; name: string; phone: string; role: "RECIPIENT" | "CLINIC" | "ADMIN"; verified: boolean };
type S = { user: AuthUser | null; favorites: string[]; loaded: boolean; refresh: () => Promise<void>; toggleFavorite: (id: string) => Promise<"ok" | "login"> };
export const useAuthStore = create<S>((set, get) => ({
  user: null, favorites: [], loaded: false,
  refresh: async () => { const r = await fetch("/api/auth/me").then((x) => x.json()).catch(() => null); set({ user: r?.user ?? null, favorites: r?.favorites ?? [], loaded: true }); },
  toggleFavorite: async (id) => {
    const { user, favorites } = get(); if (!user) return "login";
    const on = !favorites.includes(id); set({ favorites: on ? [...favorites, id] : favorites.filter((x) => x !== id) });
    const r = await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ donorId: id, on }) });
    if (!r.ok) set({ favorites }); return "ok";
  },
}));
