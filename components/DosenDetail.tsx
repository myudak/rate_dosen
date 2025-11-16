"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { Loader2, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { DosenRatingForm } from "@/components/DosenRatingForm";
import { formatReviewDate } from "@/lib/dosen";
import { cn } from "@/lib/utils";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type Plugin,
  type ScriptableContext,
} from "chart.js";
import { Bar } from "react-chartjs-2";

const QUALITY_LEVELS = [
  {
    value: 1,
    label: "Zonk banget",
    gradientLight: ["rgba(254,205,211,0.9)", "rgba(244,63,94,0.9)"],
    gradientDark: ["rgba(248,113,113,0.65)", "rgba(225,29,72,0.9)"],
  },
  {
    value: 2,
    label: "Masih nanggung",
    gradientLight: ["rgba(255,237,213,0.9)", "rgba(249,115,22,0.9)"],
    gradientDark: ["rgba(253,186,116,0.75)", "rgba(234,88,12,0.95)"],
  },
  {
    value: 3,
    label: "Lumayan asik",
    gradientLight: ["rgba(254,249,195,0.95)", "rgba(217,119,6,0.9)"],
    gradientDark: ["rgba(252,211,77,0.75)", "rgba(194,120,3,0.95)"],
  },
  {
    value: 4,
    label: "Top markotop",
    gradientLight: ["rgba(236,252,203,0.95)", "rgba(132,204,22,0.9)"],
    gradientDark: ["rgba(190,242,100,0.75)", "rgba(101,163,13,0.95)"],
  },
  {
    value: 5,
    label: "Legend banget",
    gradientLight: ["rgba(209,250,229,0.95)", "rgba(16,185,129,0.9)"],
    gradientDark: ["rgba(52,211,153,0.75)", "rgba(5,150,105,0.95)"],
  },
] as const;

const RATING_LABELS = QUALITY_LEVELS.reduce<Record<number, string>>(
  (acc, level) => {
    acc[level.value] = level.label;
    return acc;
  },
  {}
);

const DIFFICULTY_LABELS = [
  {
    value: 1,
    label: "Santuy beuud",
    color: "bg-emerald-300/90 hover:bg-emerald-300",
  },
  {
    value: 2,
    label: "Masih aman",
    color: "bg-lime-200/90 hover:bg-lime-200",
  },
  {
    value: 3,
    label: "Lumayan ribet",
    color: "bg-amber-200/90 hover:bg-amber-200",
  },
  {
    value: 4,
    label: "Serius banget",
    color: "bg-orange-200/90 hover:bg-orange-200",
  },
  {
    value: 5,
    label: "Bikin migren",
    color: "bg-rose-300/90 hover:bg-rose-300",
  },
] as const;

type RatingBucket = {
  score: number;
  descriptor: string;
  count: number;
};

const LABEL_COLUMN_WIDTH = 140;
const SCORE_COLUMN_WIDTH = 38;
const LEFT_GAP = 18;
const CHART_LEFT_PADDING = LABEL_COLUMN_WIDTH + SCORE_COLUMN_WIDTH + LEFT_GAP;

const FONT_STACK = "'Geist Sans', 'Inter', 'Segoe UI', system-ui, sans-serif";

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string
) => {
  const r = Math.min(radius, height / 2, width / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
};

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type DosenDetailProps = {
  slug: string;
};

export function DosenDetail({ slug: propSlug }: DosenDetailProps) {
  const routeParams = useParams<{ slug?: string }>();
  const slug =
    propSlug ??
    (Array.isArray(routeParams?.slug)
      ? routeParams?.slug?.[0]
      : routeParams?.slug);
  const missingSlug = !slug;
  const args = missingSlug ? "skip" : { slug };
  const dosen = useQuery(api.dosen.findDosen, args);

  const { data: ratingBuckets, maxCount: distributionMax } = useMemo(() => {
    const base: RatingBucket[] = [5, 4, 3, 2, 1].map((score) => ({
      score,
      descriptor: RATING_LABELS[score],
      count: 0,
    }));

    if (dosen?.ratings) {
      dosen.ratings.forEach((rating) => {
        const roundedScore = Math.min(
          5,
          Math.max(1, Math.round(rating.overall))
        );
        const bucket = base.find((item) => item.score === roundedScore);
        if (bucket) bucket.count += 1;
      });
    }

    const maxCount =
      base.reduce((max, item) => Math.max(max, item.count), 0) || 1;

    return {
      data: base,
      maxCount,
    };
  }, [dosen]);

  const takeAgainStats = useMemo(() => {
    if (!dosen?.ratings) {
      return { percent: null, yes: 0, total: 0 };
    }
    const votes = dosen.ratings.filter(
      (rating) =>
        rating.wouldTakeAgain === true || rating.wouldTakeAgain === false
    );
    if (votes.length === 0) {
      return { percent: null, yes: 0, total: 0 };
    }
    const yes = votes.filter((r) => r.wouldTakeAgain).length;
    return {
      percent: Math.round((yes / votes.length) * 100),
      yes,
      total: votes.length,
    };
  }, [dosen]);

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-border/60 bg-white/90 p-6 shadow-lg shadow-blue-500/10 dark:border-white/10 dark:bg-background/60">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="rounded-full bg-blue-500/10 px-3 py-1 font-semibold text-blue-700 dark:text-blue-200">
                  {dosen.universityName}
                </span>
              </div>
              <h1 className="mt-3 text-4xl font-black text-foreground">
                {dosen.name}
              </h1>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                {dosen.department}
              </p>
              {dosen.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {dosen.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Overall
              </p>
              <p className="text-5xl font-black text-foreground">
                {dosen.averageRating.toFixed(1)}
                <span className="text-2xl text-muted-foreground"> / 5</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Berdasarkan {dosen.ratingCount} rating
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-foreground">
                Mau ambil lagi?
              </p>
              <p className="mt-1 text-3xl font-black text-emerald-600 dark:text-emerald-300">
                {takeAgainStats.percent !== null
                  ? `${takeAgainStats.percent}%`
                  : "Belum ada"}
              </p>
              <p className="text-xs text-muted-foreground">
                {takeAgainStats.percent !== null
                  ? `${takeAgainStats.yes} dari ${takeAgainStats.total} mahasiswa bilang yes`
                  : "Belum ada suara soal ambil lagi"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-foreground">Kesulitan</p>
              <p className="mt-1 text-3xl font-black text-orange-500 dark:text-orange-300">
                {dosen.averageDifficulty.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">
                1 santai banget — 5 bikin migren
              </p>
            </div>
          </div>
          {dosen.tags.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-foreground">
                Tag paling sering
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {dosen.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-400/15 dark:text-blue-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#form-rating"
              className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-px hover:bg-blue-700"
            >
              Kasih rating
            </a>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-blue-600 px-5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:text-blue-200 dark:hover:bg-blue-400/15"
            >
              Lihat dosen lain
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-linear-to-b from-white/95 to-white/70 p-6 shadow-lg dark:border-white/10 dark:from-white/5 dark:to-white/2">
          <p className="text-lg font-bold text-foreground">Distribusi Rating</p>
          <p className="text-sm text-muted-foreground">
            Seberapa sering tiap bintang dipilih
          </p>
          <div className="mt-5">
            <RatingDistributionChart
              buckets={ratingBuckets}
              maxCount={distributionMax}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Review terbaru
          </h2>
          {dosen.ratings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-muted-foreground/40 px-4 py-8 text-sm text-muted-foreground">
              Belum ada review. Jadilah yang pertama memberikan penilaian!
            </div>
          ) : (
            <div className="space-y-3">
              {dosen.ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="rounded-2xl border border-border/50 bg-white/85 p-4 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/70"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {rating.student ?? "Anonim"}{" "}
                      {rating.course ? `• ${rating.course}` : ""}
                    </span>
                    <span>{formatReviewDate(rating.createdAt)}</span>
                  </div>
                  {rating.comment && (
                    <p className="mt-2 text-base text-foreground">
                      &ldquo;{rating.comment}&rdquo;
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-semibold text-amber-600 dark:text-amber-400">
                      <Star className="h-3 w-3 fill-current" />
                      {rating.overall.toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      Kesulitan {rating.difficulty.toFixed(1)}
                    </span>
                    {typeof rating.wouldTakeAgain === "boolean" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 font-semibold text-blue-700 dark:text-blue-200">
                        {rating.wouldTakeAgain ? "Mau ambil lagi" : "Skip aja"}
                      </span>
                    )}
                    {rating.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wide dark:bg-white/4"
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

        <div
          id="form-rating"
          className="rounded-3xl border border-border/50 bg-white/90 p-5 shadow-lg backdrop-blur dark:border-white/10 dark:bg-background/80"
        >
          <h2 className="text-lg font-semibold text-foreground">
            Tambah pengalamanmu
          </h2>
          <p className="text-sm text-muted-foreground">
            Review baru akan otomatis tampil di daftar review di samping.
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

type RatingDistributionChartProps = {
  buckets: RatingBucket[];
  maxCount: number;
};

function RatingDistributionChart({
  buckets,
  maxCount,
}: RatingDistributionChartProps) {
  const { resolvedTheme } = useTheme();
  const chartTheme = useMemo(() => {
    const isDark = resolvedTheme === "dark";
    const defaultPalette = QUALITY_LEVELS[QUALITY_LEVELS.length - 1];
    const [fallbackStart, fallbackEnd] = isDark
      ? defaultPalette.gradientDark
      : defaultPalette.gradientLight;
    return {
      isDark,
      fallbackStart,
      fallbackEnd,
      track: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
      label: isDark ? "rgba(241,245,249,0.95)" : "rgba(15,23,42,0.95)",
      subLabel: isDark ? "rgba(148,163,184,0.9)" : "rgba(71,85,105,0.9)",
      value: isDark ? "rgba(248,250,252,0.95)" : "rgba(30,41,59,0.95)",
      tooltipBg: isDark ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.98)",
      tooltipBorder: isDark ? "rgba(148,163,184,0.4)" : "rgba(94,116,141,0.2)",
    } as const;
  }, [resolvedTheme]);

  const chartData = useMemo<ChartData<"bar">>(
    () => ({
      labels: buckets.map((bucket) => bucket.descriptor),
      datasets: [
        {
          label: "Jumlah rating",
          data: buckets.map((bucket) => bucket.count),
          borderRadius: 999,
          borderSkipped: false,
          barPercentage: 0.75,
          categoryPercentage: 0.85,
          backgroundColor: (context: ScriptableContext<"bar">) => {
            const { chart } = context;
            const { ctx, chartArea } = chart;
            const bucket = buckets[context.dataIndex];
            const palette =
              QUALITY_LEVELS.find((level) => level.value === bucket?.score) ??
              QUALITY_LEVELS[QUALITY_LEVELS.length - 1];
            const [startColor, endColor] = chartTheme.isDark
              ? palette.gradientDark
              : palette.gradientLight;
            if (!chartArea) {
              return endColor ?? chartTheme.fallbackEnd;
            }
            const gradient = ctx.createLinearGradient(
              chartArea.left,
              0,
              chartArea.right,
              0
            );
            gradient.addColorStop(0, startColor ?? chartTheme.fallbackStart);
            gradient.addColorStop(1, endColor ?? chartTheme.fallbackEnd);
            return gradient;
          },
        },
      ],
    }),
    [buckets, chartTheme]
  );

  const chartOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      animation: { duration: 450, easing: "easeOutQuad" },
      interaction: { mode: "nearest", intersect: false, axis: "y" },
      layout: {
        padding: {
          left: CHART_LEFT_PADDING,
          right: 48,
          top: 16,
          bottom: 16,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: Math.max(1, maxCount),
          grid: { display: false },
          border: { display: false },
          ticks: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: { display: false },
          border: { display: false },
          ticks: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: chartTheme.tooltipBg,
          borderColor: chartTheme.tooltipBorder,
          borderWidth: 1,
          displayColors: false,
          padding: 12,
          titleFont: { family: FONT_STACK, size: 12, weight: 600 },
          bodyFont: { family: FONT_STACK, size: 12 },
          callbacks: {
            title: (items) => {
              const item = items[0];
              const bucket = buckets[item.dataIndex];
              return bucket
                ? `${bucket.score} — ${bucket.descriptor}`
                : "Rating";
            },
            label: (item) => `${item.parsed.x} suara`,
          },
        },
      },
    }),
    [buckets, chartTheme, maxCount]
  );

  const ratingPlugins = useMemo<Plugin<"bar">[]>(() => {
    const trackPlugin: Plugin<"bar"> = {
      id: "ratingTrack",
      beforeDatasetsDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.x) return;
        const xAxis = scales.x as typeof scales.x & {
          left: number;
          right: number;
        };
        ctx.save();
        const bars = chart.getDatasetMeta(0).data as unknown as Array<{
          height: number;
          y: number;
        }>;
        bars.forEach((bar) => {
          const height = bar.height ?? 0;
          const centerY = bar.y ?? 0;
          const width = xAxis.right - xAxis.left;
          drawRoundedRect(
            ctx,
            xAxis.left,
            centerY - height / 2,
            width,
            height,
            height / 2,
            chartTheme.track
          );
        });
        ctx.restore();
      },
    };

    const labelsPlugin: Plugin<"bar"> = {
      id: "ratingLabels",
      afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const descriptorX = chartArea.left - CHART_LEFT_PADDING + 8;
        const scoreX = chartArea.left - SCORE_COLUMN_WIDTH + 4;
        ctx.save();
        ctx.textBaseline = "middle";
        chart.getDatasetMeta(0).data.forEach((bar, index) => {
          const bucket = buckets[index];
          if (!bucket) return;
          const centerY = (bar as { y?: number }).y ?? 0;
          ctx.textAlign = "left";
          ctx.font = `600 13px ${FONT_STACK}`;
          ctx.fillStyle = chartTheme.label;
          ctx.fillText(bucket.descriptor, descriptorX, centerY);
          ctx.font = `600 12px ${FONT_STACK}`;
          ctx.fillStyle = chartTheme.subLabel;
          ctx.fillText(String(bucket.score), scoreX, centerY);
        });
        ctx.restore();
      },
    };

    const valuePlugin: Plugin<"bar"> = {
      id: "ratingValues",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = `600 12px ${FONT_STACK}`;
        ctx.fillStyle = chartTheme.value;
        const dataset = chart.data.datasets[0];
        const bars = chart.getDatasetMeta(0).data as unknown as Array<{
          x: number;
          y: number;
        }>;
        bars.forEach((bar, index) => {
          const value = dataset.data[index];
          if (typeof value !== "number") return;
          const offset = value === 0 ? 6 : 12;
          ctx.fillText(String(value), (bar.x ?? 0) + offset, bar.y ?? 0);
        });
        ctx.restore();
      },
    };

    return [trackPlugin, labelsPlugin, valuePlugin];
  }, [buckets, chartTheme]);

  return (
    <div className="h-[280px] w-full">
      <Bar
        key={chartTheme.isDark ? "rating-chart-dark" : "rating-chart-light"}
        data={chartData}
        options={chartOptions}
        plugins={ratingPlugins}
      />
    </div>
  );
}
