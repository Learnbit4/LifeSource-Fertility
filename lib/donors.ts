// MOCK DATA ONLY. Replace with DB-backed API; never ship fabricated donors or stats.
import type { Tier } from "./pricing";
export type Donor = {
  tier: Tier; // set manually; do NOT derive from physical traits
  id: string; code: string; height: number; hair: string; eyes: string; ethnicity: string;
  blood: "A+"|"A-"|"B+"|"B-"|"AB+"|"O+"|"O-"; cmv: "Negative"|"Positive";
  carrier: "Clear (CF, SMA, Fragile X)"|"Carrier: 1 recessive"; education: string;
  hobbies: string[]; hasAudio: boolean; hasChildPhoto: boolean; mot20: number; mot10: number;
};
const E = ["Bachelor's","Master's","PhD","Associate"], H = ["Brown","Black","Blonde","Red"], Y = ["Brown","Blue","Green","Hazel"];
const R = ["Black / African","White / European","East Asian","South Asian","Latino","Mixed"];
const B: Donor["blood"][] = ["A+","A-","B+","B-","AB+","O+","O-"];
export const DONORS: Donor[] = Array.from({ length: 24 }, (_, i) => ({
  id: String(i + 1), tier: (i % 6 === 0 ? "PREMIUM" : "STANDARD") as Tier, code: `SS-${1000 + i * 7}`, height: 168 + ((i * 5) % 22),
  hair: H[i % 4], eyes: Y[(i * 3) % 4], ethnicity: R[i % 6], blood: B[i % 7],
  cmv: i % 5 === 0 ? "Positive" : "Negative",
  carrier: i % 4 === 0 ? "Carrier: 1 recessive" : "Clear (CF, SMA, Fragile X)",
  education: E[i % 4], hobbies: [["Chess","Running"],["Guitar","Hiking"],["Coding","Football"],["Painting","Cooking"]][i % 4],
  hasAudio: i % 3 !== 0, hasChildPhoto: i % 2 === 0, mot20: (i * 3) % 9, mot10: (i * 2) % 7,
}));
