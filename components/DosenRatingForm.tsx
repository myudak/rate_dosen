"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  PlusCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { InteractiveHoverButton } from "./ui/interactive-hover-button";

const CREATE_RATING = "dosen:createRating" as const;
const SEARCH_DOSEN = "dosen:searchDosen" as const;
const LIST_UNIVERSITIES = "universities:listUniversities" as const;

type RatingFormProps = {
  defaultName?: string;
  defaultDepartment?: string;
  defaultUniversitySlug?: string;
  nested?: boolean;
  onSuccess?: (response: { slug?: string } | undefined) => void;
};

type FormState = {
  name: string;
  department: string;
  course: string;
  overall: number;
  difficulty: number;
  comment: string;
  student: string;
  wouldTakeAgain: boolean | null;
};

const initialState: FormState = {
  name: "",
  department: "",
  course: "",
  overall: 4,
  difficulty: 3,
  comment: "",
  student: "",
  wouldTakeAgain: null,
};

type Level = {
  value: number;
  label: string;
  color: string;
};

const qualityLevels: Level[] = [
  { value: 1, label: "Zonk banget", color: "bg-rose-300/90 hover:bg-rose-300" },
  {
    value: 2,
    label: "Masih nanggung",
    color: "bg-orange-200/90 hover:bg-orange-200",
  },
  {
    value: 3,
    label: "Lumayan asik",
    color: "bg-amber-200/90 hover:bg-amber-200",
  },
  {
    value: 4,
    label: "Top markotop",
    color: "bg-lime-200/90 hover:bg-lime-200",
  },
  {
    value: 5,
    label: "Legend banget",
    color: "bg-emerald-300/90 hover:bg-emerald-300",
  },
];

const difficultyLevels: Level[] = [
  {
    value: 1,
    label: "Santuy beuud",
    color: "bg-emerald-300/90 hover:bg-emerald-300",
  },
  { value: 2, label: "Masih aman", color: "bg-lime-200/90 hover:bg-lime-200" },
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
];

const popularTags = [
  "banyak tugas",
  "santai",
  "sering kuis",
  "ngomong cepat",
  "killer",
  "santuy parah",
  "baik tapi banyak tugas",
  "suka ngelawak",
  "tegas",
  "doyan cerita",
];

export function DosenRatingForm({
  defaultName,
  defaultDepartment,
  defaultUniversitySlug,
  nested = false,
  onSuccess,
}: RatingFormProps) {
  const [form, setForm] = useState<FormState>({
    ...initialState,
    name: defaultName ?? "",
    department: defaultDepartment ?? "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createRating = useMutation(CREATE_RATING as any);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedUniversitySlug, setSelectedUniversitySlug] = useState<
    string | null
  >(null);
  const [dosenQuery, setDosenQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedDosen, setSelectedDosen] = useState<DosenOption | null>(null);

  const universities = useQuery(LIST_UNIVERSITIES as any) as
    | UniversityOption[]
    | undefined;
  const dosenOptions = useQuery(SEARCH_DOSEN as any, {
    term: debouncedQuery,
    limit: 8,
  }) as DosenOption[] | undefined;
  const selectedUniversity = useMemo(
    () =>
      universities?.find(
        (university) => university.slug === selectedUniversitySlug
      ),
    [universities, selectedUniversitySlug]
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(dosenQuery), 300);
    return () => clearTimeout(timer);
  }, [dosenQuery]);

  useEffect(() => {
    setForm((previous) => ({
      ...previous,
      name: defaultName ?? previous.name,
      department: defaultDepartment ?? previous.department,
    }));
  }, [defaultName, defaultDepartment]);

  useEffect(() => {
    if (!selectedUniversitySlug && universities?.length) {
      setSelectedUniversitySlug(universities[0].slug);
    }
  }, [universities, selectedUniversitySlug]);

  useEffect(() => {
    if (defaultUniversitySlug) {
      setSelectedUniversitySlug(defaultUniversitySlug);
    }
  }, [defaultUniversitySlug]);

  useEffect(() => {
    if (selectedDosen) {
      setForm((previous) => ({
        ...previous,
        name: selectedDosen.name,
        department: selectedDosen.department,
      }));
      setSelectedUniversitySlug(selectedDosen.universitySlug);
    }
  }, [selectedDosen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUniversitySlug) {
      setErrorMessage("Pilih universitas terlebih dahulu.");
      return;
    }
    if (form.wouldTakeAgain === null) {
      setErrorMessage("Pilih dulu mau ambil dosen ini lagi atau enggak.");
      return;
    }
    if (!form.name.trim()) {
      setErrorMessage("Pilih atau buat nama dosen terlebih dahulu.");
      return;
    }
    setStatus("loading");
    setErrorMessage(null);
    try {
      const result = await createRating({
        name: form.name,
        department: form.department,
        universitySlug: selectedUniversitySlug,
        course: form.course || undefined,
        comment: form.comment || undefined,
        overall: Number(form.overall),
        difficulty: Number(form.difficulty),
        wouldTakeAgain: form.wouldTakeAgain ?? undefined,
        tags: selectedTags,
        student: form.student || undefined,
      });
      setStatus("success");
      onSuccess?.(result);
      setForm((previous) => ({
        ...previous,
        name: defaultName ?? "",
        department: defaultDepartment ?? "",
        course: "",
        comment: "",
        student: "",
        wouldTakeAgain: null,
      }));
      setSelectedTags([]);
      setSelectedDosen(null);
      setDosenQuery("");
      if (defaultUniversitySlug) {
        setSelectedUniversitySlug(defaultUniversitySlug);
      } else if (universities?.length) {
        setSelectedUniversitySlug(universities[0].slug);
      } else {
        setSelectedUniversitySlug(null);
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menyimpan rating."
      );
    }
  };

  const isSubmitting = status === "loading";

  return (
    <form
      onSubmit={handleSubmit}
      className={nested ? "space-y-4" : "flex flex-col gap-4"}
    >
      <DosenPicker
        options={dosenOptions}
        searchValue={dosenQuery}
        onSearchChange={setDosenQuery}
        selected={selectedDosen}
        onSelect={(option) => setSelectedDosen(option)}
        onClear={() => {
          setSelectedDosen(null);
          setForm((previous) => ({
            ...previous,
            name: "",
            department: "",
          }));
        }}
        onCreateNew={(name) => {
          const fallbackUniversitySlug =
            selectedUniversitySlug ??
            selectedUniversity?.slug ??
            universities?.[0]?.slug ??
            null;
          const newSelection: DosenOption = {
            id: `new-${Date.now()}`,
            name,
            department: form.department || "",
            slug: "",
            universitySlug: fallbackUniversitySlug ?? "",
            universityName:
              selectedUniversity?.name ??
              universities?.find((u) => u.slug === fallbackUniversitySlug)
                ?.name ??
              "Universitas belum dipilih",
          };
          setSelectedDosen(newSelection);
          setForm((previous) => ({
            ...previous,
            name,
          }));
          setDosenQuery(name);
          if (!selectedUniversitySlug && fallbackUniversitySlug) {
            setSelectedUniversitySlug(fallbackUniversitySlug);
          }
        }}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Jurusan / Prodi
          </label>
          <Input
            required
            value={form.department}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                department: event.target.value,
              }))
            }
            placeholder="contoh: Informatika"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Mata kuliah
          </label>
          <Input
            value={form.course}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                course: event.target.value,
              }))
            }
            placeholder="opsional"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Nama kamu
          </label>
          <Input
            value={form.student}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                student: event.target.value,
              }))
            }
            placeholder="opsional"
          />
        </div>
      </div>
      <UniversityPicker
        options={universities}
        selectedSlug={selectedUniversitySlug}
        onSelect={(slug) => setSelectedUniversitySlug(slug)}
      />
      <WouldTakeAgainSelector
        value={form.wouldTakeAgain}
        onChange={(wouldTakeAgain) =>
          setForm((previous) => ({
            ...previous,
            wouldTakeAgain,
          }))
        }
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <RatingPillSelector
          title="Rating keseluruhan"
          value={form.overall}
          levels={qualityLevels}
          onChange={(value) =>
            setForm((previous) => ({
              ...previous,
              overall: value,
            }))
          }
        />
        <RatingPillSelector
          title="Tingkat kesulitan"
          value={form.difficulty}
          levels={difficultyLevels}
          onChange={(value) =>
            setForm((previous) => ({
              ...previous,
              difficulty: value,
            }))
          }
        />
      </div>

      <ReviewSection
        value={form.comment}
        onChange={(value) =>
          setForm((previous) => ({
            ...previous,
            comment: value,
          }))
        }
      />
      <TagPicker
        tags={selectedTags}
        onToggle={(tag) =>
          setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
          )
        }
      />
      {errorMessage && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {errorMessage}
        </div>
      )}
      {status === "success" && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
          Terima kasih! Rating kamu berhasil disimpan.
        </div>
      )}
      <InteractiveHoverButton
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full gap-2 rounded-2xl text-base font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <PlusCircle className="h-4 w-4" />
            Kirim rating
          </>
        )}
      </InteractiveHoverButton>
    </form>
  );
}

type SelectorProps = {
  title: string;
  value: number;
  levels: Level[];
  onChange: (value: number) => void;
};

function RatingPillSelector({ title, value, levels, onChange }: SelectorProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value;
  const activeLevel = useMemo(() => {
    return levels.find((level) => level.value === displayValue) ?? levels[0];
  }, [levels, displayValue]);

  return (
    <div className="space-y-1.5 rounded-2xl border border-border/50 bg-white/70 p-3 shadow-inner dark:bg-white/[0.03]">
      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        {title}
      </label>
      <div className="mt-2 flex overflow-hidden rounded-full border border-border/50 bg-white/80 p-1 shadow-sm dark:bg-background">
        {levels.map((level, index) => (
          <button
            type="button"
            key={level.value}
            onClick={() => onChange(level.value)}
            onMouseEnter={() => setHoverValue(level.value)}
            onMouseLeave={() => setHoverValue(null)}
            className={cn(
              "flex-1 h-9 transition focus-visible:outline-none",
              level.color,
              index === 0 && "rounded-l-full",
              index === levels.length - 1 && "rounded-r-full",
              value === level.value
                ? "ring-2 ring-offset-2 ring-blue-400 ring-offset-white dark:ring-offset-slate-900"
                : "opacity-70 hover:opacity-100"
            )}
            aria-label={`${level.value} - ${level.label}`}
          />
        ))}
      </div>
      <p className="text-center text-xs font-semibold text-muted-foreground">
        {displayValue} - {activeLevel.label}
      </p>
    </div>
  );
}

type TagPickerProps = {
  tags: string[];
  onToggle: (tag: string) => void;
};

function TagPicker({ tags, onToggle }: TagPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Pilih vibe dosennya
        </label>
        <span className="text-xs text-muted-foreground">
          {tags.length}/5 tag dipilih
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => {
          const active = tags.includes(tag);
          return (
            <button
              type="button"
              key={tag}
              onClick={() => onToggle(tag)}
              disabled={!active && tags.length >= 5}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                active
                  ? "border-blue-500 bg-blue-100/70 text-blue-700 shadow-sm dark:border-blue-400 dark:bg-blue-400/20 dark:text-blue-100"
                  : "border-border/60 bg-white/80 text-muted-foreground hover:border-blue-400 hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70",
                !active && tags.length >= 5 && "opacity-40 cursor-not-allowed"
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm dark:bg-blue-400/25 dark:text-blue-100"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onToggle(tag)}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-200 dark:hover:text-blue-50"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

type WouldTakeAgainSelectorProps = {
  value: boolean | null;
  onChange: (value: boolean) => void;
};

function WouldTakeAgainSelector({
  value,
  onChange,
}: WouldTakeAgainSelectorProps) {
  const options = [
    {
      value: true,
      label: "Yes",
      icon: Check,
      color: "green",
    },
    {
      value: false,
      label: "No",
      icon: X,
      color: "red",
    },
  ];

  return (
    <div className="rounded-3xl border border-border/60 bg-white/80 p-4 shadow-inner dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-sm font-semibold text-foreground">
        Mau ambil dosen ini lagi?
        <span className="text-red-500"> *</span>
      </p>
      <div className="mt-4 flex items-center gap-8 justify-center">
        {options.map((option) => {
          const active = value === option.value;
          const Icon = option.icon;
          const isYes = option.color === "green";
          const activeColor = isYes
            ? "border-emerald-500 ring-emerald-500/25 text-emerald-600 dark:text-emerald-300"
            : "border-rose-500 ring-rose-500/25 text-rose-600 dark:text-rose-300";
          const hoverColor = isYes
            ? "group-hover:border-emerald-400 group-hover:bg-emerald-50/80 dark:group-hover:bg-emerald-400/15"
            : "group-hover:border-rose-400 group-hover:bg-rose-50/80 dark:group-hover:bg-rose-400/15";

          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onChange(option.value)}
              className="group flex cursor-pointer flex-col items-center gap-2 focus-visible:outline-none"
            >
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border-2 border-border/60 bg-white/90 transition-all duration-200 shadow-sm dark:border-white/15 dark:bg-white/[0.06]",
                  hoverColor,
                  active &&
                    `${activeColor} ring-4 scale-105 shadow-md hover:scale-105`
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 opacity-60 transition-transform duration-200",
                    active && "opacity-100 scale-110",
                    isYes
                      ? "text-emerald-500 group-hover:text-emerald-600 dark:text-emerald-300"
                      : "text-rose-500 group-hover:text-rose-600 dark:text-rose-300"
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-sm text-muted-foreground transition-colors duration-200",
                  active &&
                    (isYes
                      ? "font-semibold text-emerald-600 dark:text-emerald-300"
                      : "font-semibold text-rose-600 dark:text-rose-300")
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ReviewSectionProps = {
  value: string;
  onChange: (value: string) => void;
};

function ReviewSection({ value, onChange }: ReviewSectionProps) {
  const maxLength = 350;
  const remaining = maxLength - value.length;
  const [showGuidelines, setShowGuidelines] = useState(true);

  return (
    <div className="space-y-3 rounded-3xl border border-border/60 bg-white/80 p-4 shadow-inner dark:border-white/10 dark:bg-white/[0.03]">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          Tulis Review <span className="text-red-500">*</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Ceritakan pengalamanmu tentang gaya ngajar, cara jelasin materi, atau tips buat mahasiswa lain.
        </p>
      </div>
      <div className="rounded-2xl border border-border/70 bg-white/90 p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <button
          type="button"
          onClick={() => setShowGuidelines((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 text-left"
          aria-expanded={showGuidelines}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-100">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Guidelines</p>
              <p className="text-sm text-muted-foreground">Jaga sopan santun ya</p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              showGuidelines ? "rotate-180" : "rotate-0"
            )}
          />
        </button>
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
            showGuidelines ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <ul className="mt-3 list-disc space-y-2 pl-10 text-sm text-muted-foreground">
              <li>Hindari kata kasar atau ngejelek-jelekin orang.</li>
              <li>Jangan asal nuduh (misal SARA/favoritisme) tanpa bukti.</li>
              <li>Ceritain hal berguna: gaya ngajar, tipe tugas/ujian, tips lulus.</li>
            </ul>
            <Link
              href="/panduan"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-300"
            >
              Lihat panduan lengkap
            </Link>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/60 shadow-inner focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:bg-white/[0.02]">
        <textarea
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Apa yang perlu diketahui mahasiswa lain tentang dosen ini?"
          className="min-h-[150px] w-full rounded-2xl border-none bg-transparent p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="flex justify-end px-3 pb-2 text-[12px] text-muted-foreground">
          {remaining}/{maxLength}
        </div>
      </div>
    </div>
  );
}

type DosenPickerProps = {
  options?: DosenOption[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  selected: DosenOption | null;
  onSelect: (option: DosenOption) => void;
  onClear: () => void;
  onCreateNew: (name: string) => void;
};

function DosenPicker({
  options,
  searchValue,
  onSearchChange,
  selected,
  onSelect,
  onClear,
  onCreateNew,
}: DosenPickerProps) {
  const [open, setOpen] = useState(false);
  const isLoading = !options;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>();
  const trimmedQuery = searchValue.trim();
  const showCreateNew =
    trimmedQuery.length > 0 && !isLoading && (options?.length ?? 0) === 0;
  const showEmpty =
    !isLoading && (options?.length ?? 0) === 0 && !showCreateNew;

  const handleSelect = (option: DosenOption) => {
    onSelect(option);
    onSearchChange(option.name);
    setOpen(false);
  };

  const handleClear = () => {
    onClear();
    onSearchChange("");
  };

  const handleCreateNew = (name: string) => {
    onCreateNew(name);
    setOpen(false);
  };

  useEffect(() => {
    if (!triggerRef.current) return;
    const updateWidth = () => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth);
      }
    };
    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(triggerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="space-y-2 rounded-3xl border border-border/50 bg-white/70 p-4 shadow-inner dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Pilih dosen
        </label>
        {selected && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto px-2 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
            onClick={handleClear}
          >
            Ganti dosen
          </Button>
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            ref={triggerRef}
            className="flex h-11 w-full items-center justify-between rounded-2xl border-border/60 bg-white/80 px-3 text-left font-normal shadow-inner hover:border-blue-400 hover:bg-white dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {selected ? selected.name : "Cari atau pilih dosen"}
              </span>
              <span className="text-xs text-muted-foreground">
                {selected
                  ? `${selected.department} - ${selected.universityName}`
                  : "Mulai ketik untuk mencari di database dosen"}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="p-0"
          style={
            triggerWidth
              ? {
                  width: `${triggerWidth}px`,
                }
              : undefined
          }
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Cari dosen yang sudah ada..."
              value={searchValue}
              onValueChange={onSearchChange}
            />
            <CommandList>
              <CommandGroup>
                {(options ?? []).map((option) => (
                  <CommandItem
                    key={option.id}
                    value={`${option.name} ${option.department}`}
                    onSelect={() => handleSelect(option)}
                  >
                    <div className="flex flex-col items-start">
                      <p className="text-sm font-semibold text-foreground">
                        {option.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {option.department}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                        {option.universityName}
                      </p>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 opacity-0",
                        selected?.id === option.id && "opacity-100"
                      )}
                    />
                  </CommandItem>
                ))}
                {showCreateNew && (
                  <CommandItem
                    value={trimmedQuery}
                    onSelect={() => handleCreateNew(trimmedQuery)}
                  >
                    Buat dosen baru: "{trimmedQuery}"
                  </CommandItem>
                )}
              </CommandGroup>
              {(showEmpty || isLoading) && (
                <CommandEmpty>
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat dosen...
                    </span>
                  ) : (
                    "Tidak ada dosen ditemukan. Isi form di bawah untuk menambahkan."
                  )}
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-600 dark:text-blue-300">
          <p className="font-semibold text-foreground">
            {selected.name} - {selected.department}
          </p>
          <p className="text-xs text-blue-500/80">{selected.universityName}</p>
        </div>
      )}
    </div>
  );
}

type UniversityPickerProps = {
  options?: UniversityOption[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
};

function UniversityPicker({
  options,
  selectedSlug,
  onSelect,
}: UniversityPickerProps) {
  if (!options || options.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-muted-foreground/40 px-4 py-6 text-sm text-muted-foreground">
        Data universitas belum tersedia.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Pilih universitas
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((university) => {
          const active = selectedSlug === university.slug;
          return (
            <button
              type="button"
              key={university.id}
              onClick={() => onSelect(university.slug)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition",
                active
                  ? "border-blue-500 bg-blue-500/10 shadow-sm dark:border-blue-400/70 dark:bg-blue-400/15"
                  : "border-border/60 bg-white/80 hover:border-blue-400 dark:border-white/10 dark:bg-white/[0.03]"
              )}
            >
              <p className="text-sm font-semibold text-foreground">
                {university.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {university.dosenCount ?? 0} dosen terdaftar
              </p>
              <p className="text-xs text-muted-foreground">
                {university.reviewCount ?? 0} review total
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
type DosenOption = {
  id: string;
  name: string;
  department: string;
  slug: string;
  universitySlug: string;
  universityName: string;
};

type UniversityOption = {
  id: string;
  slug: string;
  name: string;
  dosenCount?: number;
  reviewCount?: number;
  averageQuality?: number;
};
