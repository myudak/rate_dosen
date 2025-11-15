"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Loader2, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
};

const initialState: FormState = {
  name: "",
  department: "",
  course: "",
  overall: 4,
  difficulty: 3,
  comment: "",
  student: "",
};

type Level = {
  value: number;
  label: string;
  color: string;
};

const qualityLevels: Level[] = [
  { value: 1, label: "Zonk banget", color: "bg-rose-300/90 hover:bg-rose-300" },
  { value: 2, label: "Masih nanggung", color: "bg-orange-200/90 hover:bg-orange-200" },
  { value: 3, label: "Lumayan asik", color: "bg-amber-200/90 hover:bg-amber-200" },
  { value: 4, label: "Top markotop", color: "bg-lime-200/90 hover:bg-lime-200" },
  { value: 5, label: "Legend banget", color: "bg-emerald-300/90 hover:bg-emerald-300" },
];

const difficultyLevels: Level[] = [
  { value: 1, label: "Santuy beuud", color: "bg-emerald-300/90 hover:bg-emerald-300" },
  { value: 2, label: "Masih aman", color: "bg-lime-200/90 hover:bg-lime-200" },
  { value: 3, label: "Lumayan ribet", color: "bg-amber-200/90 hover:bg-amber-200" },
  { value: 4, label: "Serius banget", color: "bg-orange-200/90 hover:bg-orange-200" },
  { value: 5, label: "Bikin migren", color: "bg-rose-300/90 hover:bg-rose-300" },
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
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createRating = useMutation(CREATE_RATING as any);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedUniversitySlug, setSelectedUniversitySlug] = useState<
    string | null
  >(null);
  const [dosenQuery, setDosenQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedDosen, setSelectedDosen] = useState<DosenOption | null>(null);

  const universities = useQuery(
    LIST_UNIVERSITIES as any
  ) as UniversityOption[] | undefined;
  const dosenOptions = useQuery(
    SEARCH_DOSEN as any,
    { term: debouncedQuery, limit: 8 }
  ) as DosenOption[] | undefined;

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
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Nama dosen
          </label>
          <Input
            required
            value={form.name}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
            placeholder="contoh: Ibu Sari"
          />
        </div>
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
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Ceritakan pengalamanmu
        </label>
        <textarea
          value={form.comment}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              comment: event.target.value,
            }))
          }
          placeholder="Bagikan tips untuk mahasiswa lain..."
          className="min-h-[120px] w-full rounded-2xl border border-border/60 bg-background/60 p-3 text-sm text-foreground outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:bg-white/[0.02]"
        />
      </div>
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
      <Button
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
      </Button>
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
    return (
      levels.find((level) => level.value === displayValue) ?? levels[0]
    );
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

type DosenPickerProps = {
  options?: DosenOption[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  selected: DosenOption | null;
  onSelect: (option: DosenOption) => void;
  onClear: () => void;
};

function DosenPicker({
  options,
  searchValue,
  onSearchChange,
  selected,
  onSelect,
  onClear,
}: DosenPickerProps) {
  return (
    <div className="space-y-2 rounded-3xl border border-border/50 bg-white/70 p-4 shadow-inner dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Pilih dosen
        </label>
        {selected && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-300"
          >
            Ganti dosen
          </button>
        )}
      </div>
      <Input
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Cari dosen yang sudah ada..."
      />
      {selected && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-600 dark:text-blue-300">
          {selected.name} • {selected.department}
          <p className="text-xs text-blue-500/80">
            {selected.universityName}
          </p>
        </div>
      )}
      <div className="max-h-48 space-y-1 overflow-y-auto pt-2">
        {(options ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Tidak ada dosen ditemukan. Isi form di bawah untuk menambahkan.
          </p>
        ) : (
          options?.map((option) => (
            <button
              type="button"
              key={option.id}
              onClick={() => onSelect(option)}
              className="w-full rounded-xl border border-border/60 px-3 py-2 text-left transition hover:border-blue-400 hover:bg-blue-500/5"
            >
              <p className="text-sm font-semibold text-foreground">
                {option.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {option.department}
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                {option.universityName}
              </p>
            </button>
          ))
        )}
      </div>
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
