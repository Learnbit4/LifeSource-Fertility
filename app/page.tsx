import HeroSearch from "@/components/HeroSearch";
import PricingSection from "@/components/PricingSection";
export default function Home() {
  return (<main>
    <section className="bg-navy px-6 pb-24 pt-20 text-paper"><div className="mx-auto max-w-5xl">
      <h1 className="max-w-2xl font-display text-5xl leading-tight">Choose a donor with the full picture in front of you.</h1>
      <p className="mt-4 max-w-xl text-paper/75">Filter by traits, screening results and voice. Compare up to three donors side by side.</p>
      <div className="mt-10 text-ink"><HeroSearch /></div></div></section>
    <PricingSection />
    {/* TODO Step 2: ImpactCalculator, HowItWorks tabs, TrustBadges (only show real accreditation) */}
  </main>);
}
