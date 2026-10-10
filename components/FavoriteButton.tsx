"use client";
import { Heart } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
export default function FavoriteButton({ donorId, withLabel = false }: { donorId: string; withLabel?: boolean }) {
  const { favorites, toggleFavorite } = useAuthStore(); const on = favorites.includes(donorId);
  return (<button aria-pressed={on} aria-label={on ? "Remove from saved donors" : "Save donor"} className="inline-flex items-center gap-1 text-sm text-teal"
    onClick={async () => { if ((await toggleFavorite(donorId)) === "login") window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`; }}>
    <Heart size={18} className={on ? "fill-teal" : ""} />{withLabel && (on ? "Saved" : "Save donor")}</button>);
}
