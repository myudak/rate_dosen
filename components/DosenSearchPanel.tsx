"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import {
  Loader2,
  NotebookPen,
  Search,
  Sparkles,
  Star,
  TableProperties,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { DosenRatingForm } from "@/components/DosenRatingForm";
import { DosenRatedCard } from "@/components/DosenRatedCard";
import { cn } from "@/lib/utils";
import { formatReviewDate } from "@/lib/dosen";

const SEARCH_DOSEN = "dosen:searchDosen" as const;
const FIND_DOSEN = "dosen:findDosen" as const;

type BasicDosen = {
  id: string;
  name: string;
  department: string;
  slug: string;
  universityName: string;
  universitySlug: string;
  tags: string[];
  ratingCount: number;
  averageRating: number;
  averageDifficulty: number;
  lastReviewSnippet?: string;
};

type DetailedDosen = BasicDosen & {
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
};

const tabs = [
  {
    id: "search",
    label: "Cari dosen",
    description: "Temukan dosen favoritmu dengan filter real-time.",
    icon: Search,
  },
  {
    id: "rated",
    label: "Daftar rating",
    description: "Lihat dosen paling sering dinilai mahasiswa.",
    icon: TableProperties,
  },
  {
    id: "rating",
    label: "Buat rating",
    description: "Bagikan pengalaman kuliahmu agar mahasiswa lain terbantu.",
    icon: NotebookPen,
  },
] as const;

export type DosenTabId = (typeof tabs)[number]["id"];

type DosenSearchPanelProps = {
  initialTab?: DosenTabId;
};

export function DosenSearchPanel({ initialTab = "search" }: DosenSearchPanelProps) {
  const [activeTab, setActiveTab] = useState<DosenTabId>(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchArgs = useMemo(
    () => ({
      term: debouncedTerm,
      limit: 8,
    }),
    [debouncedTerm]
  );

  const searchResults = useQuery(
    SEARCH_DOSEN as any,
    searchArgs
  ) as BasicDosen[] | undefined;

  const ratedList = useQuery(
    SEARCH_DOSEN as any,
    { limit: 12 }
  ) as BasicDosen[] | undefined;

  const findArgs = selectedSlug ? { slug: selectedSlug } : "skip";
  const selectedDosen = useQuery(
    FIND_DOSEN as any,
    findArgs
  ) as DetailedDosen | undefined | null;

  const renderSearchTab = () => (
    <div className="space-y-5">
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          Cari dosen berdasarkan nama atau jurusan
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Contoh: Budi, Sistem Informasi..."
            className="h-11 pl-10"
          />
        </div>
      </div>
      <div className="space-y-4">
        {!searchResults && (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-muted-foreground/40 px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sinkronisasi dengan Convex...
          </div>
        )}
        {searchResults && searchResults.length === 0 && (
          <div className="rounded-xl border border-dashed border-muted-foreground/40 px-4 py-3 text-sm text-muted-foreground">
            Belum ada data untuk pencarian ini. Yuk tambahkan rating pertamamu!
          </div>
        )}
        {searchResults && searchResults.length > 0 && (
          <ul className="space-y-2">
            {searchResults.map((dosen) => {
              const isActive = dosen.slug === selectedSlug;
              return (
                <li key={dosen.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedSlug(dosen.slug)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3 text-left transition hover:border-blue-400 hover:bg-blue-500/10",
                      isActive
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-border/60"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {dosen.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dosen.department}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/70">
                        {dosen.universityName}
                      </p>
                    </div>
                      <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                        {dosen.averageRating.toFixed(1)}
                      </div>
                    </div>
                    {dosen.lastReviewSnippet && (
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        “{dosen.lastReviewSnippet}”
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {selectedDosen && (
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 dark:border-white/10">
          <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-blue-500 dark:text-blue-300">
                  Profil singkat
                </p>
                <h3 className="text-base font-semibold text-foreground">
                  {selectedDosen.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDosen.department}
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80">
                  {selectedDosen.universityName}
                </p>
              </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Rating rata-rata</p>
              <p className="text-lg font-semibold text-foreground">
                {selectedDosen.averageRating.toFixed(1)}{" "}
                <span className="text-xs text-muted-foreground">/5</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedDosen.ratingCount} review
              </p>
            </div>
          </div>
          {selectedDosen.ratings?.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedDosen.ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="rounded-xl bg-background/70 p-3 text-sm shadow-sm dark:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {rating.student ? rating.student : "Anonim"}{" "}
                      {rating.course ? `• ${rating.course}` : ""}
                    </span>
                    <span>{formatReviewDate(rating.createdAt)}</span>
                  </div>
                  {rating.comment && (
                    <p className="mt-1 text-sm text-foreground">
                      “{rating.comment}”
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                      <Star className="h-3 w-3 fill-current" />
                      {rating.overall.toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                      Kesulitan: {rating.difficulty.toFixed(1)}
                    </span>
                    {rating.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80 dark:bg-white/[0.04]"
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
      )}
    </div>
  );

  const renderRatedTab = () => (
    <div className="space-y-4">
      {(ratedList ?? []).map((dosen) => (
        <DosenRatedCard
          key={dosen.id}
          dosen={dosen}
          onSelect={() => {
            setSelectedSlug(dosen.slug);
            setActiveTab("search");
          }}
        />
      ))}
      {!ratedList && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-muted-foreground/40 px-4 py-10 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Mengambil daftar rating terbaru...
        </div>
      )}
    </div>
  );

  const renderRatingTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500 dark:text-blue-300">
            Buat rating
          </p>
          <h3 className="text-base font-semibold text-foreground">
            Tambahkan pengalamanmu
          </h3>
        </div>
        <NotebookPen className="h-5 w-5 text-blue-500 dark:text-blue-300" />
      </div>
      <DosenRatingForm
        nested
        defaultName={selectedDosen?.name}
        defaultDepartment={selectedDosen?.department}
        defaultUniversitySlug={selectedDosen?.universitySlug}
        onSuccess={(response) => {
          if (response?.slug) {
            setSelectedSlug(response.slug);
            setActiveTab("search");
          }
        }}
      />
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-6 rounded-3xl border border-border/40 bg-white/80 p-6 shadow-2xl shadow-blue-500/10 backdrop-blur-sm dark:border-white/10 dark:bg-background/60">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500 dark:text-blue-300">
            Database real-time
          </p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            Kelola data dosen dalam satu panel
          </h2>
        </div>
        <Sparkles className="h-6 w-6 text-blue-500 dark:text-blue-300" />
      </div>
      <div className="grid gap-2 rounded-2xl border border-border/50 bg-background/40 p-2 dark:bg-white/[0.02] sm:grid-cols-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full flex-col items-start gap-1 rounded-xl p-3 text-left transition",
                isActive
                  ? "bg-white shadow-sm dark:bg-background"
                  : "hover:bg-white/70 hover:shadow-sm dark:hover:bg-white/[0.05]"
              )}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon className="h-4 w-4" />
                {tab.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {tab.description}
              </span>
            </button>
          );
        })}
      </div>
      <div className="rounded-3xl border border-dashed border-border/50 bg-white/70 p-5 dark:bg-background/70">
        {activeTab === "search" && renderSearchTab()}
        {activeTab === "rated" && renderRatedTab()}
        {activeTab === "rating" && renderRatingTab()}
      </div>
    </div>
  );
}
