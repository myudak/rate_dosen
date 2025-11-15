import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  dosen: defineTable({
    name: v.string(),
    department: v.string(),
    slug: v.string(),
    universityId: v.optional(v.id("universities")),
    universityName: v.optional(v.string()),
    universitySlug: v.optional(v.string()),
    keywords: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    ratingCount: v.number(),
    totalRating: v.number(),
    averageRating: v.number(),
    totalDifficulty: v.number(),
    averageDifficulty: v.number(),
    lastReviewSnippet: v.optional(v.string()),
    updatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_updatedAt", ["updatedAt"])
    .index("by_university", ["universityId"]),
  ratings: defineTable({
    dosenId: v.id("dosen"),
    overall: v.number(),
    difficulty: v.number(),
    comment: v.optional(v.string()),
    course: v.optional(v.string()),
    tags: v.array(v.string()),
    student: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_dosen", ["dosenId"]),
  universities: defineTable({
    name: v.string(),
    slug: v.string(),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),
});
