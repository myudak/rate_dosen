"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { DosenRatedCard, RatedDosen } from "@/components/DosenRatedCard";

const SEARCH_DOSEN = "dosen:searchDosen" as const;

export function HeroDosenPreview() {
  const results = useQuery(SEARCH_DOSEN as any, {
    limit: 3,
  }) as RatedDosen[] | undefined;

  return (
    <div className="rounded-3xl border border-border/40 bg-white/80 p-4 shadow-lg shadow-blue-500/10 dark:border-white/10 dark:bg-background/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500 dark:text-blue-300">
            Rating terbaru
          </p>
          <h3 className="text-base font-semibold text-foreground">
            Dosen favorit mahasiswa
          </h3>
        </div>
        <Link
          href="/rated"
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-300"
        >
          Lihat semua
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {!results && (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-muted-foreground/30 px-3 py-6 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Menarik data dosen...
          </div>
        )}
        {results &&
          results
            .slice(0, 2)
            .map((dosen) => (
              <DosenRatedCard
                key={dosen.id}
                dosen={dosen}
                href={`/dosen/${dosen.slug}`}
              />
            ))}
      </div>
    </div>
  );
}
