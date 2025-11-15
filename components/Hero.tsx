import { Highlighter } from "@/components/ui/highlighter";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { InfoIcon, TrendingUp, Users } from "lucide-react";
import { SpinningText } from "./ui/spinning-text";
import Link from "next/link";
import { DosenRatingForm } from "./DosenRatingForm";
import { HeroDosenPreview } from "./HeroDosenPreview";
import SquigglyArrow from "./ui/squiggle-arrow";
import { FeatureCarouselDemo } from "./FeatureCarousel";

const heroTabs = [
  {
    id: "search",
    label: "Cari dosen",
    description: "Lihat review terbaru mahasiswa.",
    href: "/dosen",
  },
  {
    id: "rated",
    label: "Daftar rating",
    description: "Lihat seluruh kartu dosen.",
    href: "/rated",
  },
  {
    id: "rating",
    label: "Buat rating",
    description: "Bagikan pengalamanmu sekarang.",
    href: "/dosen?tab=rating",
  },
];

export default function Hero() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-15%] h-64 w-64 -translate-x-1/2 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/10 sm:h-80 sm:w-80" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 translate-x-1/4 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-500/10 sm:h-96 sm:w-96" />
      </div>
      <SpinningText
        radius={5}
        className="absolute right-4 top-16 z-10 hidden lg:block xl:right-16 xl:top-20"
      >
        Rate your lecturers honestly
      </SpinningText>
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-0 text-center sm:gap-12 lg:text-left ">
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 ">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-100/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-blue-700 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-300">
            Platform review dosen
          </span>
          <h1 className="text-balance text-4xl font-black uppercase leading-tight text-gray-900 drop-shadow-lg dark:text-white dark:drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)] sm:text-5xl md:text-6xl lg:text-7xl">
            Rate{" "}
            <Highlighter action="highlight" color="#87CEFA">
              Dosen
            </Highlighter>{" "}
            Lu
          </h1>
          <p className="text-balance max-w-2xl text-sm text-gray-700 drop-shadow-md dark:text-white/80 sm:text-base ">
            Temukan dan bagikan penilaian jujur untuk membantu mahasiswa memilih
            dosen terbaik.
          </p>
          <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
            <Input
              placeholder="Cari dosen..."
              className="h-11 w-full shadow-lg sm:h-12 md:h-14"
            />
          </div>
          <div className="w-full max-w-md rounded-2xl border border-blue-200/60 bg-white/70 p-2 shadow-lg dark:border-white/10 dark:bg-white/[0.04] sm:max-w-lg md:max-w-xl lg:max-w-2xl">
            <div className="grid gap-2 sm:grid-cols-2">
              {heroTabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="rounded-xl border border-transparent bg-blue-500/5 p-3 text-left transition hover:border-blue-400 hover:bg-blue-500/10 dark:hover:border-blue-300/40"
                >
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                    {tab.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tab.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 sm:gap-3 md:gap-4 md:justify-start md:pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs sm:gap-2 sm:text-sm"
            >
              <InfoIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Panduan
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs sm:gap-2 sm:text-sm"
            >
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Komunitas
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-muted-foreground sm:text-sm md:justify-start">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-500" />
              12k+ mahasiswa terbantu
            </div>
            <div className="hidden items-center gap-1.5 md:flex">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              1.2k review baru bulan ini
            </div>
          </div>
        </div>

        {/* Feature Carousel Section */}
        <section className="relative w-full py-12 sm:py-16 md:py-20">
          <FeatureCarouselDemo />
        </section>

        <div className="flex w-full justify-center">
          <SquigglyArrow direction="down" className="text-[#87cefa]" />
        </div>

        <div className="relative flex  ">
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
    </>
  );
}
