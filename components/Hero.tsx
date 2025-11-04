import { Highlighter } from "@/components/ui/highlighter";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { InfoIcon, TrendingUp, Users } from "lucide-react";
import { SpinningText } from "./ui/spinning-text";
import { InfiniteSlider } from "./motion-primitives/infinite-slider";

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
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-0 text-center sm:gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)] lg:text-left">
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 md:items-start">
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
          <p className="text-balance max-w-2xl text-sm text-gray-700 drop-shadow-md dark:text-white/80 sm:text-base md:text-lg">
            Temukan dan bagikan penilaian jujur untuk membantu mahasiswa memilih
            dosen terbaik.
          </p>
          <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
            <Input
              placeholder="Cari dosen..."
              className="h-11 w-full shadow-lg sm:h-12 md:h-14"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 sm:gap-3 md:gap-4 md:justify-start md:pt-4">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <InfoIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Panduan
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Top Dosen
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
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
        <div className="relative flex justify-center lg:justify-end">
          <div className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-border/40 bg-white/80 p-6 shadow-2xl shadow-blue-500/10 backdrop-blur-sm dark:border-white/10 dark:bg-background/60 lg:max-w-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500 dark:text-blue-300">
                  Tren Minggu Ini
                </p>
                <h2 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Rating dosen paling dicari
                </h2>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-500 dark:text-blue-300" />
            </div>
            <InfiniteSlider speedOnHover={50} gap={12} className="mt-2">
              <img
                src="https://i.scdn.co/image/ab67616d00001e02ad24c5e36ddcd1957ad35677"
                alt="Dean blunt - Black Metal 2"
                className="aspect-square w-16 rounded-xl object-cover sm:w-20 md:w-24"
              />
              <img
                src="https://i.scdn.co/image/ab67616d00001e02af73f776b92d4614152fb141"
                alt="Jungle Jack - JUNGLE DES ILLUSIONS VOL 2"
                className="aspect-square w-16 rounded-xl object-cover sm:w-20 md:w-24"
              />
              <img
                src="https://i.scdn.co/image/ab67616d00001e02ecdb8f824367a53468100faf"
                alt="Yung Lean - Stardust"
                className="aspect-square w-16 rounded-xl object-cover sm:w-20 md:w-24"
              />
              <img
                src="https://i.scdn.co/image/ab67616d00001e021624590458126fc8b8c64c2f"
                alt="Lana Del Rey - Ultraviolence"
                className="aspect-square w-16 rounded-xl object-cover sm:w-20 md:w-24"
              />
              <img
                src="https://i.scdn.co/image/ab67616d00001e020dcf0f3680cff56fe5ff2288"
                alt="A$AP Rocky - Tailor Swif"
                className="aspect-square w-16 rounded-xl object-cover sm:w-20 md:w-24"
              />
              <img
                src="https://i.scdn.co/image/ab67616d00001e02bc1028b7e9cd2b17c770a520"
                alt="Midnight Miami (feat Konvy) - Nino Paid, Konvy"
                className="aspect-square w-16 rounded-xl object-cover sm:w-20 md:w-24"
              />
            </InfiniteSlider>
            <p className="text-sm text-muted-foreground">
              Dapatkan insight dari mahasiswa lain dan buat keputusan kuliah dengan percaya diri.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
