import React from "react";
import Navbar from "@/components/Public/Navbar/Navbar";
import Footer from "@/components/Public/Footer/Footer";
import AboutHero from "@/components/Public/About/AboutHero";
import AboutPinboard from "@/components/Public/About/AboutPinboard";
import AboutPrinciples from "@/components/Public/About/AboutPrinciples";
import AboutNexus from "@/components/Public/About/AboutNexus";
import AboutWorkflow from "@/components/Public/About/AboutWorkflow";
import AboutPerspectives from "@/components/Public/About/AboutPerspectives";
import AboutSharedVision from "@/components/Public/About/AboutSharedVision";
import AboutImpact from "@/components/Public/About/AboutImpact";
import AboutPinboardWall from "@/components/Public/About/AboutPinboardWall";
import AboutHorizon from "@/components/Public/About/AboutHorizon";

export const metadata = {
  title: "About Us | Creator Hub",
  description:
    "Where visionary minds pin culture into reality. An art-directed sanctuary for prestige brands and auteur creators.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />
      <AboutHero />
      <AboutPinboard />
      <AboutPrinciples />
      <AboutNexus />
      <AboutWorkflow />
      <AboutPerspectives />
      <AboutSharedVision />
      <AboutImpact />
      <AboutPinboardWall />
      <AboutHorizon />
      <Footer />
    </main>
  );
}
