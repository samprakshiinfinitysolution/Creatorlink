import React from "react";
import Navbar from "@/components/Public/Navbar/Navbar";
import Footer from "@/components/Public/Footer/Footer";
import HowItWorksHero from "@/components/Public/HowItWorks/HowItWorksHero";
import HowItWorksConnection from "@/components/Public/HowItWorks/HowItWorksConnection";
import HowItWorksDiscovery from "@/components/Public/HowItWorks/HowItWorksDiscovery";
import HowItWorksCreate from "@/components/Public/HowItWorks/HowItWorksCreate";
import HowItWorksConnect from "@/components/Public/HowItWorks/HowItWorksConnect";
import HowItWorksCollaborate from "@/components/Public/HowItWorks/HowItWorksCollaborate";
import HowItWorksCreateContent from "@/components/Public/HowItWorks/HowItWorksCreateContent";
import HowItWorksReviewApprove from "@/components/Public/HowItWorks/HowItWorksReviewApprove";
import HowItWorksPay from "@/components/Public/HowItWorks/HowItWorksPay";
import HowItWorksGrow from "@/components/Public/HowItWorks/HowItWorksGrow";
import HowItWorksLifecycle from "@/components/Public/HowItWorks/HowItWorksLifecycle";
import HowItWorksMosaic from "@/components/Public/HowItWorks/HowItWorksMosaic";
import HowItWorksFinalCTA from "@/components/Public/HowItWorks/HowItWorksFinalCTA";

export const metadata = {
  title: "How It Works | Creatorlink",
  description:
    "Creator Hub brings brands and creators together through one simple, structured collaboration journey.",
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />
      <HowItWorksHero />
      <HowItWorksConnection />
      <HowItWorksDiscovery />
      <HowItWorksCreate />
      <HowItWorksConnect />
      <HowItWorksCollaborate />
      <HowItWorksCreateContent />
      <HowItWorksReviewApprove />
      <HowItWorksPay />
      <HowItWorksGrow />
      <HowItWorksLifecycle />
      <HowItWorksMosaic />
      <HowItWorksFinalCTA />
      <Footer />
    </main>
  );
}
