import Navbar from "@/components/Public/Navbar/Navbar";
import Footer from "@/components/Public/Footer/Footer";
import PricingPlans from "@/components/Public/Pricing/PricingPlans";
import PricingWorkflow from "@/components/Public/Pricing/PricingWorkflow";
import PricingCTA from "@/components/Public/Pricing/PricingCTA";
import TrustedBrands from "@/components/Public/Pricing/TrustedBrands";
import PricingAutomatedInbound from "@/components/Public/Pricing/PricingAutomatedInbound";
import PricingCreatorDiscovery from "@/components/Public/Pricing/PricingCreatorDiscovery";
import PricingPerformance from "@/components/Public/Pricing/PricingPerformance";
import PricingFAQ from "@/components/Public/Pricing/PricingFAQ";
import PricingGrowthCTA from "@/components/Public/Pricing/PricingGrowthCTA";

export const metadata = {
  title: "Pricing | Creatorlink",
  description:
    "Transparent pricing tiers built for digital tastemakers and forward-thinking luxury brands.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />
      <PricingPlans />
      <TrustedBrands />
      <PricingCTA />
      <PricingWorkflow />
      <PricingAutomatedInbound />
      <PricingCreatorDiscovery />
      <PricingPerformance />
      <PricingFAQ />
      <PricingGrowthCTA />
      <Footer />
    </main>
  );
}
