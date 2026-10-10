"use client";
import { useMoney } from "@/store/useCurrencyStore";
export default function Price({ usd }: { usd: number }) { const f = useMoney(); return <>{f(usd)}</>; }
