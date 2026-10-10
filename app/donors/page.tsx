"use client";
import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import FilterPanel from "@/components/FilterPanel";
import DonorCard from "@/components/DonorCard";
import CompareDrawer from "@/components/CompareDrawer";
import { applyFilters, useDonorStore } from "@/store/useDonorStore";
export default function Donors() {
  const { filters, filtersOpen, setFiltersOpen, reset } = useDonorStore();
  const list = useMemo(() => applyFilters(filters), [filters]);
  return (<main className="mx-auto max-w-7xl px-6 pb-28 pt-10">
    <div className="flex items-center justify-between"><h1 className="font-display text-3xl text-navy">{list.length} donors match</h1>
      <button className="flex items-center gap-2 rounded-lg border border-teal px-3 py-2 text-teal lg:hidden" onClick={() => setFiltersOpen(true)}>
        <SlidersHorizontal size={16} /> Filters</button></div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="hidden self-start lg:sticky lg:top-6 lg:block"><FilterPanel /></aside>
      {filtersOpen && (<div className="fixed inset-0 z-40 bg-navy/60 lg:hidden" onClick={() => setFiltersOpen(false)}>
        <div className="ml-auto h-full w-[85%] max-w-sm overflow-auto bg-paper p-6" onClick={(e) => e.stopPropagation()}>
          <button aria-label="Close filters" className="mb-4" onClick={() => setFiltersOpen(false)}><X /></button><FilterPanel /></div></div>)}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>{list.map((d) => <DonorCard key={d.id} d={d} />)}</AnimatePresence>
        {!list.length && <p className="col-span-full text-ink/60">No donors match. <button className="text-teal underline" onClick={reset}>Reset filters</button> to see everyone.</p>}
      </section></div><CompareDrawer /></main>);
}
