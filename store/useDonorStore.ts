import { create } from "zustand";
import { DONORS, type Donor } from "@/lib/donors";
export type Filters = { hair: string[]; eyes: string[]; ethnicity: string[]; blood: string[];
  minHeight: number; cmvNegativeOnly: boolean; clearCarrierOnly: boolean; audioOnly: boolean; childPhotoOnly: boolean; };
export const defaultFilters: Filters = { hair: [], eyes: [], ethnicity: [], blood: [], minHeight: 160,
  cmvNegativeOnly: false, clearCarrierOnly: false, audioOnly: false, childPhotoOnly: false };
type S = { filters: Filters; compare: string[]; filtersOpen: boolean;
  toggleIn: (k: "hair"|"eyes"|"ethnicity"|"blood", v: string) => void;
  set: <K extends keyof Filters>(k: K, v: Filters[K]) => void; reset: () => void;
  toggleCompare: (id: string) => void; clearCompare: () => void; setFiltersOpen: (o: boolean) => void; };
export const useDonorStore = create<S>((set, get) => ({
  filters: defaultFilters, compare: [], filtersOpen: false,
  toggleIn: (k, v) => set(({ filters }) => ({ filters: { ...filters,
    [k]: filters[k].includes(v) ? filters[k].filter((x) => x !== v) : [...filters[k], v] } })),
  set: (k, v) => set(({ filters }) => ({ filters: { ...filters, [k]: v } })),
  reset: () => set({ filters: defaultFilters }),
  toggleCompare: (id) => { const c = get().compare;
    set({ compare: c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c }); },
  clearCompare: () => set({ compare: [] }), setFiltersOpen: (o) => set({ filtersOpen: o }),
}));
export const applyFilters = (f: Filters): Donor[] => DONORS.filter((d) =>
  (!f.hair.length || f.hair.includes(d.hair)) && (!f.eyes.length || f.eyes.includes(d.eyes)) &&
  (!f.ethnicity.length || f.ethnicity.includes(d.ethnicity)) && (!f.blood.length || f.blood.includes(d.blood)) &&
  d.height >= f.minHeight && (!f.cmvNegativeOnly || d.cmv === "Negative") &&
  (!f.clearCarrierOnly || d.carrier.startsWith("Clear")) && (!f.audioOnly || d.hasAudio) &&
  (!f.childPhotoOnly || d.hasChildPhoto));
