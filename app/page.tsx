import { DosenRatingForm } from "@/components/DosenRatingForm";
import { FeatureCarouselDemo } from "@/components/FeatureCarousel";
import Hero from "@/components/Hero";
import { HeroDosenPreview } from "@/components/HeroDosenPreview";
import SquigglyArrow from "@/components/ui/squiggle-arrow";
import React from "react";

const Page = () => {
  return (
    <main className="min-h-screen w-full pt-14 sm:pt-16">
      {/* Hero Section - Full viewport height */}
      <section className="relative flex min-h-[calc(100vh-3.5rem)] w-full items-center justify-center overflow-hidden px-4 py-12 sm:min-h-[calc(100vh-4rem)] sm:px-6 sm:py-16 lg:px-12">
        <Hero />
      </section>
      {/* Feature Carousel Section */}
      {/* <section className="relative w-full py-12 sm:py-16 md:py-20">
          <FeatureCarouselDemo />
        </section> */}

      <div className="flex w-full justify-center">
        <SquigglyArrow direction="down" className="text-[#87cefa]" />
      </div>

      <div className="flex justify-center">
        <div className="relative flex  max-w-4xl  m-4">
          <div className="flex w-full   flex-col gap-6">
            <div className="rounded-3xl border border-border/40 bg-white/80 p-5 shadow-2xl shadow-blue-500/10 backdrop-blur-sm dark:border-white/10 dark:bg-background/60 ">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500 dark:text-blue-300">
                    Buat rating
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Ceritakan pengalamanmu
                  </h2>
                </div>
              </div>
              <div className="mt-4">
                <DosenRatingForm nested />
              </div>
            </div>
            <HeroDosenPreview />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
