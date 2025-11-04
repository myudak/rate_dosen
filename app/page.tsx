import { FeatureCarouselDemo } from "@/components/FeatureCarousel";
import Hero from "@/components/Hero";
import React from "react";

const Page = () => {
  return (
    <main className="min-h-screen w-full pt-14 sm:pt-16">
      {/* Hero Section - Full viewport height */}
      <section className="relative flex min-h-[calc(100vh-3.5rem)] w-full items-center justify-center overflow-hidden px-4 py-12 sm:min-h-[calc(100vh-4rem)] sm:px-6 sm:py-16 lg:px-12">
        <Hero />
      </section>

      {/* Feature Carousel Section */}
      <section className="relative w-full py-12 sm:py-16 md:py-20">
        <FeatureCarouselDemo />
      </section>
    </main>
  );
};

export default Page;
