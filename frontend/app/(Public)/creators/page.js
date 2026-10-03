import Navbar from "@/components/Public/Navbar/Navbar";
import Footer from "@/components/Public/Footer/Footer";
import CreatorsHero from "@/components/Public/Creators/CreatorsHero";
import CreatorIdentity from "@/components/Public/Creators/CreatorIdentity";
import CreatorDiscovery from "@/components/Public/Creators/CreatorDiscovery";
import CreatorAutonomy from "@/components/Public/Creators/CreatorAutonomy";
import CreatorCollaboration from "@/components/Public/Creators/CreatorCollaboration";
import CreatorProduction from "@/components/Public/Creators/CreatorProduction";
import CreatorDignity from "@/components/Public/Creators/CreatorDignity";
import CreatorReputation from "@/components/Public/Creators/CreatorReputation";
import CreatorLifecycle from "@/components/Public/Creators/CreatorLifecycle";
import CreatorVisualGallery from "@/components/Public/Creators/CreatorVisualGallery";
import CreatorFinalCTA from "@/components/Public/Creators/CreatorFinalCTA";

export const metadata = {
  title: "For Creators | Creatorlink",
  description:
    "The private digital sanctuary where elite taste, creative autonomy, and top-tier luxury brand partnerships converge.",
};

export default function CreatorsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />
      <CreatorsHero />
      <CreatorIdentity />
      <CreatorDiscovery />
      <CreatorAutonomy />
      <CreatorCollaboration />
      <CreatorProduction />
      <CreatorDignity />
      <CreatorReputation />
      <CreatorLifecycle />
      <CreatorVisualGallery />
      <CreatorFinalCTA />
      <Footer />
    </main>
  );
}