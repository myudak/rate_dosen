"use client";

import { useQuery } from "convex/react";
import { Loader2, GraduationCap } from "lucide-react";
import Link from "next/link";

const LIST_UNIVERSITIES = "universities:listUniversities" as const;

type University = {
  id: string;
  name: string;
  slug: string;
  dosenCount: number;
  reviewCount: number;
  averageQuality: number;
};

export function UniversityList() {
  const universities = useQuery(
    LIST_UNIVERSITIES as any
  ) as University[] | undefined;

  if (!universities) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-dashed border-muted-foreground/40 px-4 py-12 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Mengambil data universitas...
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {universities.map((uni) => (
        <div
          key={uni.id}
          className="flex flex-col justify-between rounded-3xl border border-border/60 bg-white/90 p-5 shadow-lg shadow-blue-500/10 transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl dark:border-white/10 dark:bg-background/80"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-500 dark:text-blue-300">
                Kampus
              </p>
              <h3 className="text-xl font-bold text-foreground">{uni.name}</h3>
            </div>
            <GraduationCap className="h-6 w-6 text-blue-500 dark:text-blue-300" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-300">
              <p className="text-xs text-blue-500/70">Dosen</p>
              <p className="text-xl">{uni.dosenCount}</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              <p className="text-xs text-emerald-500/70">Review</p>
              <p className="text-xl">{uni.reviewCount}</p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-600 dark:text-amber-300">
              <p className="text-xs text-amber-500/70">Quality</p>
              <p className="text-xl">{uni.averageQuality.toFixed(1)}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end text-sm">
            <Link
              href={`/dosen?tab=rated`}
              className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-300"
            >
              Lihat dosen &rarr;
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
