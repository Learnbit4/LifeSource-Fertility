import type { Donor } from "./donors";
// DEMO DATA derived from the mock donor. Replace with real screening records from the backend.
const HIST = ["None reported", "Type 2 diabetes (grandfather, diagnosed in his 70s)", "Hypertension (mother, managed)", "Asthma (sibling, childhood)", "Migraine (aunt)"];
export function detailFor(d: Donor) {
  const n = Number(d.id);
  return {
    bio: `Education: ${d.education}. Interests: ${d.hobbies.join(", ")}. (Demo bio.)`,
    screening: [
      { test: "Blood type", result: d.blood }, { test: "CMV", result: d.cmv },
      { test: "Carrier screening panel", result: d.carrier },
      { test: "HIV, hepatitis B/C, syphilis", result: "Negative (demo data)" }, { test: "Karyotype", result: "Normal (demo data)" },
    ],
    family: [
      { relation: "Mother", note: HIST[n % 5] }, { relation: "Father", note: HIST[(n + 1) % 5] },
      { relation: "Siblings", note: HIST[(n + 2) % 5] }, { relation: "Grandparents", note: HIST[(n + 3) % 5] },
    ],
  };
}
