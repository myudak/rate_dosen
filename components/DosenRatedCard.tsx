import Link from "next/link";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { estimateWouldTakeAgain, qualityColor } from "@/lib/dosen";

export type RatedDosen = {
  id: string;
  slug: string;
  name: string;
  department: string;
  ratingCount: number;
  averageRating: number;
  averageDifficulty: number;
  tags: string[];
  lastReviewSnippet?: string;
};

type DosenRatedCardProps = {
  dosen: RatedDosen;
  href?: string;
  onSelect?: () => void;
  className?: string;
  showBookmark?: boolean;
};

export function DosenRatedCard({
  dosen,
  href,
  onSelect,
  className,
  showBookmark = true,
}: DosenRatedCardProps) {
  const takeAgain = estimateWouldTakeAgain(
    dosen.averageRating,
    dosen.averageDifficulty
  );
  const content = (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-3xl border border-border/60 bg-white/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg dark:bg-background/80",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex flex-col items-center rounded-2xl px-4 py-3 text-sm font-semibold uppercase",
            qualityColor(dosen.averageRating)
          )}
        >
          <span className="text-[11px] tracking-[0.35em]">Quality</span>
          <span className="text-3xl font-black">
            {dosen.averageRating.toFixed(1)}
          </span>
          <span className="text-[11px] font-medium lowercase">
            {dosen.ratingCount} rating
            {dosen.ratingCount > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {dosen.name}
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                {dosen.department}
              </p>
              {dosen.tags.length > 0 && (
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
                  {dosen.tags.slice(0, 2).join(" • ")}
                </p>
              )}
            </div>
            {showBookmark && (
              <Bookmark className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{takeAgain}% </span>
            mau ambil lagi |{" "}
            <span className="font-semibold text-foreground">
              {dosen.averageDifficulty.toFixed(1)}
            </span>{" "}
            tingkat kesulitan
          </p>
          {dosen.lastReviewSnippet && (
            <p className="text-sm text-foreground">
              “{dosen.lastReviewSnippet}”
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} className="w-full text-left">
        {content}
      </button>
    );
  }

  return content;
}
