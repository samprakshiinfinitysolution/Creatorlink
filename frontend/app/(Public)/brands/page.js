import Navbar from "@/components/Public/Navbar/Navbar";
import Footer from "@/components/Public/Footer/Footer";
import BrandsHero from "@/components/Public/Brands/BrandsHero";
import InteractiveJourney from "@/components/Public/Brands/InteractiveJourney";
import CreatorDiscovery from "@/components/Public/Brands/CreatorDiscovery";
import BrandFinalCTA from "@/components/Public/Brands/BrandFinalCTA";

export const metadata = {
  title: "For Brands | Creatorlink",
  description:
    "Your brand. Their influence. One meaningful collaboration.",
};

export default function BrandsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />
      <BrandsHero />
      <InteractiveJourney />
      <CreatorDiscovery />
      <BrandFinalCTA />
      <Footer />
    </main>
  );
}

