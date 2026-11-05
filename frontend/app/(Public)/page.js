import Navbar from "@/components/Public/Navbar/Navbar";
import Hero from "@/components/Public/Home/Hero";
import CreatorShowcase from "@/components/Public/Home/CreatorShowcase";
import CreatorDiscovery from "@/components/Public/Home/CreatorDiscovery";
import CuratedCatalog from "@/components/Public/Home/CuratedCatalog";
import SpotlightCarousel from "@/components/Public/Home/SpotlightCarousel";
import MaisonProtocol from "@/components/Public/Home/MaisonProtocol";
import EnterpriseLuxury from "@/components/Public/Home/EnterpriseLuxury";
import CreatorMonetization from "@/components/Public/Home/CreatorMonetization";
import PlatformStats from "@/components/Public/Home/PlatformStats";
import TrustedBrands from "@/components/Public/Home/TrustedBrands";
import SalonTestimonials from "@/components/Public/Home/SalonTestimonials";
import ProtocolArchitecture from "@/components/Public/Home/ProtocolArchitecture";
import CollaborationCTA from "@/components/Public/Home/CollaborationCTA";
import Footer from "@/components/Public/Footer/Footer";
import ThreeDotLoader from "@/components/common/Loader/ThreeDotLoader";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <ThreeDotLoader />
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
