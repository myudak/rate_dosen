"use client";

import { useQuery } from "convex/react";
import { Loader2, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { DosenRatingForm } from "@/components/DosenRatingForm";
import { formatReviewDate } from "@/lib/dosen";

const FIND_DOSEN = "dosen:findDosen" as const;

type DosenDetailProps = {
  slug: string;
};

export function DosenDetail({ slug: propSlug }: DosenDetailProps) {
  const routeParams = useParams<{ slug?: string }>();
  const slug = propSlug ?? (Array.isArray(routeParams?.slug) ? routeParams?.slug?.[0] : routeParams?.slug);
  const missingSlug = !slug;
  const args = missingSlug ? "skip" : { slug };
  const dosen = useQuery(FIND_DOSEN as any, args) as
    | {
        id: string;
        name: string;
        department: string;
        universityName: string;
        universitySlug: string;
        universityName: string;
        universitySlug: string;
        ratingCount: number;
        averageRating: number;
        averageDifficulty: number;
        tags: string[];
        description?: string;
        ratings: {
          id: string;
          overall: number;
          difficulty: number;
          comment?: string;
          course?: string;
          createdAt: number;
          tags: string[];
          student?: string;
        }[];
      }
    | null
    | undefined;

  if (missingSlug) {
    return (
      <div className="rounded-3xl border border-yellow-500/40 bg-yellow-500/10 px-6 py-10 text-center text-sm text-yellow-700 dark:text-yellow-200">
        URL detail dosen tidak valid.
      </div>
    );
  }

  if (dosen === undefined) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-dashed border-muted-foreground/40 px-6 py-16 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Mengambil detail dosen...
      </div>
    );
  }

  if (dosen === null) {
    return (
      <div className="rounded-3xl border border-red-500/40 bg-red-500/5 px-6 py-10 text-center text-sm text-red-600 dark:text-red-400">
        Data dosen tidak ditemukan. Coba kembali ke daftar rating.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-lg shadow-blue-500/10 dark:border-white/10 dark:bg-background/60">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500 dark:text-blue-300">
          Profil dosen
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">{dosen.name}</h1>
          <p className="text-base text-muted-foreground">{dosen.department}</p>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80">
            {dosen.universityName}
          </p>
        </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div>
              <p className="text-xs uppercase tracking-[0.3em]">Rating</p>
              <p className="text-2xl font-bold text-foreground">
                {dosen.averageRating.toFixed(1)}
              </p>
              <span>{dosen.ratingCount} review</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em]">Kesulitan</p>
              <p className="text-2xl font-bold text-foreground">
                {dosen.averageDifficulty.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
        {dosen.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {dosen.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-[11px] uppercase tracking-wide dark:bg-white/[0.04]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        {dosen.description && (
          <p className="mt-4 text-sm text-muted-foreground">{dosen.description}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,0.35fr)]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Review terbaru</h2>
          {dosen.ratings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-muted-foreground/40 px-4 py-8 text-sm text-muted-foreground">
              Belum ada review. Jadilah yang pertama memberikan penilaian!
            </div>
          ) : (
            <div className="space-y-3">
              {dosen.ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="rounded-2xl border border-border/50 bg-white/80 p-4 text-sm shadow-sm dark:border-white/10 dark:bg-background/70"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {rating.student ?? "Anonim"}{" "}
                      {rating.course ? `• ${rating.course}` : ""}
                    </span>
                    <span>{formatReviewDate(rating.createdAt)}</span>
                  </div>
                  {rating.comment && (
                    <p className="mt-2 text-base text-foreground">
                      “{rating.comment}”
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-semibold text-amber-600 dark:text-amber-400">
                      <Star className="h-3 w-3 fill-current" />
                      {rating.overall.toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                      Kesulitan {rating.difficulty.toFixed(1)}
                    </span>
                    {rating.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wide dark:bg-white/[0.04]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-3xl border border-border/50 bg-white/80 p-5 shadow-lg dark:border-white/10 dark:bg-background/80">
          <h2 className="text-lg font-semibold text-foreground">
            Tambah pengalamanmu
          </h2>
          <p className="text-sm text-muted-foreground">
            Review baru akan otomatis tampil di sisi kiri begitu disimpan.
          </p>
          <div className="mt-4">
            <DosenRatingForm
              nested
              defaultName={dosen.name}
              defaultDepartment={dosen.department}
              defaultUniversitySlug={dosen.universitySlug}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
