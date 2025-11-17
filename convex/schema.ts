import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============ USER & AUTH ============
  users: defineTable({
    authId: v.string(), // Better Auth user ID
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.union(
      v.literal("student"),
      v.literal("lecturer"),
      v.literal("admin")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_authId", ["authId"])
    .index("by_email", ["email"]),

  // ============ CAMPUS ============
  campuses: defineTable({
    name: v.string(),
    slug: v.string(),
    city: v.optional(v.string()),
    type: v.optional(v.string()), // "PTN" | "PTS" | etc
    website: v.optional(v.string()),
    emailDomains: v.array(v.string()), // e.g. ["ui.ac.id", "student.ui.ac.id"]
    status: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("rejected")
    ),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    submittedByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  // ============ EMAIL VERIFICATION ============
  emailVerifications: defineTable({
    userId: v.id("users"),
    campusId: v.id("campuses"),
    email: v.string(),
    domain: v.string(),
    token: v.optional(v.string()),
    isVerified: v.boolean(),
    verifiedAt: v.optional(v.number()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_campus", ["campusId"])
    .index("by_user_campus", ["userId", "campusId"])
    .index("by_token", ["token"]),

  // ============ LECTURERS ============
  lecturers: defineTable({
    campusId: v.id("campuses"),
    name: v.string(),
    slug: v.string(),
    title: v.optional(v.string()), // "Dr.", "Prof.", etc
    department: v.string(),
    photoUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    claimedByUserId: v.optional(v.id("users")),
    keywords: v.string(), // searchable text
    // Aggregated ratings
    reviewCount: v.number(),
    avgOverall: v.number(),
    avgClarity: v.number(),
    avgFairness: v.number(),
    avgDifficulty: v.number(),
    lastReviewSnippet: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_campus", ["campusId"])
    .index("by_slug", ["slug"])
    .index("by_campus_slug", ["campusId", "slug"])
    .index("by_updatedAt", ["updatedAt"]),

  // ============ COURSES ============
  courses: defineTable({
    campusId: v.id("campuses"),
    code: v.string(), // e.g. "CS101"
    name: v.string(),
    slug: v.string(),
    departmentId: v.optional(v.string()),
    sks: v.optional(v.number()),
    type: v.optional(v.string()), // "Wajib" | "Pilihan"
    recommendedSemester: v.optional(v.number()),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_campus", ["campusId"])
    .index("by_slug", ["slug"])
    .index("by_campus_slug", ["campusId", "slug"])
    .index("by_code", ["code"]),

  // ============ REVIEWS ============
  reviews: defineTable({
    campusId: v.id("campuses"),
    lecturerId: v.id("lecturers"),
    courseId: v.optional(v.id("courses")),
    authorId: v.id("users"),
    // Ratings (1-5 scale)
    ratingOverall: v.number(),
    ratingClarity: v.optional(v.number()),
    ratingFairness: v.optional(v.number()),
    ratingDifficulty: v.optional(v.number()),
    // Content
    comment: v.optional(v.string()),
    tags: v.array(v.string()), // e.g. ["caring", "tough grader"]
    term: v.optional(v.string()), // e.g. "Semester 1 2024"
    // Flags
    isAnonymous: v.boolean(),
    isReported: v.boolean(),
    isHidden: v.boolean(),
    // Engagement
    helpfulScore: v.number(), // denormalized from votes
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lecturer", ["lecturerId"])
    .index("by_course", ["courseId"])
    .index("by_campus", ["campusId"])
    .index("by_author", ["authorId"])
    .index("by_createdAt", ["createdAt"]),

  // ============ REVIEW VOTES ============
  reviewVotes: defineTable({
    reviewId: v.id("reviews"),
    userId: v.id("users"),
    value: v.number(), // +1 or -1
    createdAt: v.number(),
  })
    .index("by_review", ["reviewId"])
    .index("by_user_review", ["userId", "reviewId"]),

  // ============ COMMUNITY ============
  communityPosts: defineTable({
    campusId: v.id("campuses"),
    authorId: v.id("users"),
    title: v.string(),
    body: v.string(),
    category: v.optional(v.string()), // "discussion" | "question" | "event"
    isReported: v.boolean(),
    isHidden: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_campus", ["campusId"])
    .index("by_author", ["authorId"])
    .index("by_createdAt", ["createdAt"]),

  comments: defineTable({
    postId: v.optional(v.id("communityPosts")),
    reviewId: v.optional(v.id("reviews")),
    authorId: v.id("users"),
    body: v.string(),
    parentCommentId: v.optional(v.id("comments")),
    isReported: v.boolean(),
    isHidden: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_review", ["reviewId"])
    .index("by_author", ["authorId"])
    .index("by_parent", ["parentCommentId"]),

  // ============ LEGACY (for backward compatibility) ============
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
    wouldTakeAgain: v.optional(v.boolean()),
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
