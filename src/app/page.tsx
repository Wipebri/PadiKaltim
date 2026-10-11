"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import EvaluationWorkspace from "@/components/EvaluationWorkspace";
import Footer from "@/components/Footer";

export default function Home() {
  const handleScrollToEvaluation = () => {
    const evalSection = document.getElementById("evaluasi");
    if (evalSection) {
      evalSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <HeroSection onDetectLocation={handleScrollToEvaluation} />
        <FeaturesSection />
        <EvaluationWorkspace />
      </main>
      <Footer />
    </>
  );
}
