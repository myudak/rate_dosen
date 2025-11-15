"use client";

import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { DosenRatedCard, RatedDosen } from "@/components/DosenRatedCard";

const SEARCH_DOSEN = "dosen:searchDosen" as const;

type DosenCardListProps = {
  limit?: number;
  showLoadingCard?: boolean;
  linkToDetail?: boolean;
};

export function DosenCardList({
  limit = 20,
  showLoadingCard = true,
  linkToDetail = true,
}: DosenCardListProps) {
  const dosenList = useQuery(SEARCH_DOSEN as any, {
    limit,
  }) as RatedDosen[] | undefined;

  if (!dosenList && showLoadingCard) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-muted-foreground/40 px-4 py-10 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Mengambil daftar rating terbaru...
      </div>
    );
  }

  if ((dosenList?.length ?? 0) === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-muted-foreground/40 px-4 py-10 text-sm text-muted-foreground">
        Belum ada rating yang tersimpan. Yuk buat rating pertamamu!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(dosenList ?? []).map((dosen) => (
        <DosenRatedCard
          key={dosen.id}
          dosen={dosen}
          href={linkToDetail ? `/dosen/${dosen.slug}` : undefined}
        />
      ))}
    </div>
  );
}
