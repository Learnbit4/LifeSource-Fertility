"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
export default function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  useEffect(() => { useAuthStore.getState().refresh(); }, []);
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
