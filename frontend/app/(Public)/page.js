import Navbar from "@/components/Public/Navbar/Navbar";
import Hero from "@/components/Public/Hero/Hero";
import CreatorShowcase from "@/components/Public/CreatorShowcase/CreatorShowcase";
import CreatorDiscovery from "@/components/Public/CreatorDiscovery/CreatorDiscovery";
import CuratedCatalog from "@/components/Public/CuratedCatalog/CuratedCatalog";
import SpotlightCarousel from "@/components/Public/SpotlightCarousel/SpotlightCarousel";
import MaisonProtocol from "@/components/Public/MaisonProtocol/MaisonProtocol";
import EnterpriseLuxury from "@/components/Public/EnterpriseLuxury/EnterpriseLuxury";
import CreatorMonetization from "@/components/Public/CreatorMonetization/CreatorMonetization";
import PlatformStats from "@/components/Public/PlatformStats/PlatformStats";
import TrustedBrands from "@/components/Public/TrustedBrands/TrustedBrands";
import SalonTestimonials from "@/components/Public/SalonTestimonials/SalonTestimonials";
import ProtocolArchitecture from "@/components/Public/ProtocolArchitecture/ProtocolArchitecture";
import CollaborationCTA from "@/components/Public/CollaborationCTA/CollaborationCTA";
import Footer from "@/components/Public/Footer/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <CreatorShowcase />
      <CreatorDiscovery />
      <CuratedCatalog />
      <SpotlightCarousel />
      <MaisonProtocol />
      <EnterpriseLuxury />
      <CreatorMonetization />
      <PlatformStats />
      <TrustedBrands />
      <SalonTestimonials />
      <ProtocolArchitecture />
      <CollaborationCTA />
      <Footer />
    </main>
  );
}