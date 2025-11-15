import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { ALLOWED_UNIVERSITIES } from "./constants";

type DosenDoc = {
  _id: Id<"dosen">;
  name: string;
  department: string;
  slug: string;
  universityId?: Id<"universities">;
  universityName?: string;
  universitySlug?: string;
  keywords: string;
  description?: string;
  tags: string[];
  ratingCount: number;
  totalRating: number;
  averageRating: number;
  totalDifficulty: number;
  averageDifficulty: number;
  lastReviewSnippet?: string;
  updatedAt: number;
  createdAt: number;
};

type UniversityDoc = {
  _id: Id<"universities">;
  name: string;
  slug: string;
  code?: string;
  createdAt: number;
  description?: string;
};

const DEFAULT_UNIVERSITY = ALLOWED_UNIVERSITIES[0];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const buildKeywords = (
  name: string,
  department: string,
  tags: string[],
  universityName: string
) => [name, department, universityName, ...tags].join(" ").toLowerCase();

const chooseSnippet = (comment?: string) =>
  comment ? comment.substring(0, 180).trim() : undefined;

async function ensureUniversity(ctx: MutationCtx | QueryCtx, slug: string) {
  const allowed = ALLOWED_UNIVERSITIES.find((uni) => uni.slug === slug);
  if (!allowed) {
    throw new Error("Universitas tidak tersedia.");
  }

  const existing = (await ctx.db
    .query("universities")
    .withIndex("by_slug", (q: any) => q.eq("slug", slug))
    .unique()) as UniversityDoc | null;

  if (existing) {
    return existing;
  }

  const id = await ctx.db.insert("universities", {
    name: allowed.name,
    slug: allowed.slug,
    createdAt: Date.now(),
  });
  return (await ctx.db.get(id)) as UniversityDoc;
}

const shapeDosen = (doc: DosenDoc) => {
  const universityName = doc.universityName ?? DEFAULT_UNIVERSITY.name;
  const universitySlug = doc.universitySlug ?? DEFAULT_UNIVERSITY.slug;
  return {
    id: doc._id,
    name: doc.name,
    department: doc.department,
    slug: doc.slug,
    universityName,
    universitySlug,
    tags: doc.tags,
    ratingCount: doc.ratingCount,
    averageRating: doc.averageRating,
    averageDifficulty: doc.averageDifficulty,
    lastReviewSnippet: doc.lastReviewSnippet,
    updatedAt: doc.updatedAt,
  };
};

export const searchDosen = query({
  args: {
    term: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const normalizedTerm = (args.term ?? "").trim().toLowerCase();
    const limit = clamp(args.limit ?? 8, 3, 30);

    const raw = (await ctx.db.query("dosen").collect()) as DosenDoc[];
    const filtered = normalizedTerm
      ? raw.filter(
          (doc) =>
            doc.keywords.includes(normalizedTerm) ||
            doc.name.toLowerCase().includes(normalizedTerm) ||
            doc.department.toLowerCase().includes(normalizedTerm)
        )
      : raw;

    const sorted = filtered.sort((a, b) => {
      if (b.averageRating === a.averageRating) {
        if (b.ratingCount === a.ratingCount) {
          return b.updatedAt - a.updatedAt;
        }
        return b.ratingCount - a.ratingCount;
      }
      return b.averageRating - a.averageRating;
    });

    return sorted.slice(0, limit).map(shapeDosen);
  },
});

export const findDosen = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = (await ctx.db
      .query("dosen")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique()) as DosenDoc | null;

    if (!doc) {
      return null;
    }

    const recentRatings = await ctx.db
      .query("ratings")
      .withIndex("by_dosen", (q) => q.eq("dosenId", doc._id))
      .collect();

    const ratings = recentRatings
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((rating) => ({
        id: rating._id,
        overall: rating.overall,
        difficulty: rating.difficulty,
        comment: rating.comment,
        course: rating.course,
        createdAt: rating.createdAt,
        tags: rating.tags,
        student: rating.student,
      }));

    return {
      ...shapeDosen(doc),
      universityName: doc.universityName,
      universitySlug: doc.universitySlug,
      description: doc.description,
      ratings,
    };
  },
});

export const createRating = mutation({
  args: {
    name: v.string(),
    department: v.string(),
    universitySlug: v.string(),
    course: v.optional(v.string()),
    overall: v.number(),
    difficulty: v.number(),
    tags: v.optional(v.array(v.string())),
    comment: v.optional(v.string()),
    student: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const department = args.department.trim();
    if (!name || !department) {
      throw new Error("Nama dan jurusan dosen wajib diisi.");
    }

    const university = await ensureUniversity(ctx, args.universitySlug);

    const normalizedTags = (args.tags ?? [])
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    const overallScore = clamp(args.overall, 1, 5);
    const difficultyScore = clamp(args.difficulty, 1, 5);
    const slug = slugify(`${name}-${department}`);
    const now = Date.now();

    let dosen = (await ctx.db
      .query("dosen")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique()) as DosenDoc | null;

    if (!dosen) {
      const insertedId = await ctx.db.insert("dosen", {
        name,
        department,
        slug,
        universityId: university._id,
        universityName: university.name,
        universitySlug: university.slug,
        keywords: buildKeywords(name, department, normalizedTags, university.name),
        description: undefined,
        tags: normalizedTags,
        ratingCount: 0,
        totalRating: 0,
        averageRating: 0,
        totalDifficulty: 0,
        averageDifficulty: 0,
        lastReviewSnippet: chooseSnippet(args.comment),
        createdAt: now,
        updatedAt: now,
      });
      dosen = (await ctx.db.get(insertedId)) as DosenDoc;
    } else if (!dosen.universityId || !dosen.universitySlug) {
      await ctx.db.patch(dosen._id, {
        universityId: university._id,
        universityName: university.name,
        universitySlug: university.slug,
      });
      dosen = {
        ...dosen,
        universityId: university._id,
        universityName: university.name,
        universitySlug: university.slug,
      };
    }

    const newRatingCount = dosen.ratingCount + 1;
    const newTotalRating = dosen.totalRating + overallScore;
    const newTotalDifficulty = dosen.totalDifficulty + difficultyScore;
    const mergedTags = Array.from(new Set([...dosen.tags, ...normalizedTags]));

    await ctx.db.insert("ratings", {
      dosenId: dosen._id,
      overall: overallScore,
      difficulty: difficultyScore,
      comment: args.comment?.trim(),
      course: args.course?.trim(),
      tags: normalizedTags,
      student: args.student?.trim(),
      createdAt: now,
    });

    await ctx.db.patch(dosen._id, {
      ratingCount: newRatingCount,
      totalRating: newTotalRating,
      averageRating: Number((newTotalRating / newRatingCount).toFixed(2)),
      totalDifficulty: newTotalDifficulty,
      averageDifficulty: Number(
        (newTotalDifficulty / newRatingCount).toFixed(2)
      ),
      tags: mergedTags,
      keywords: buildKeywords(
        name,
        department,
        mergedTags,
        dosen.universityName
      ),
      lastReviewSnippet: chooseSnippet(args.comment) ?? dosen.lastReviewSnippet,
      updatedAt: now,
    });

    return {
      slug,
      ratingCount: newRatingCount,
      averageRating: Number((newTotalRating / newRatingCount).toFixed(2)),
      averageDifficulty: Number(
        (newTotalDifficulty / newRatingCount).toFixed(2)
      ),
      universitySlug: dosen.universitySlug,
    };
  },
});
