import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const buildKeywords = (name: string, department: string, title?: string) =>
  [name, department, title].filter(Boolean).join(" ").toLowerCase();

/**
 * Search lecturers
 */
export const searchLecturers = query({
  args: {
    term: v.optional(v.string()),
    campusId: v.optional(v.id("campuses")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const term = (args.term ?? "").toLowerCase().trim();
    const limit = args.limit ?? 20;

    let lecturers;
    if (args.campusId) {
      lecturers = await ctx.db
        .query("lecturers")
        .withIndex("by_campus", (q) => q.eq("campusId", args.campusId!))
        .collect();
    } else {
      lecturers = await ctx.db.query("lecturers").collect();
    }

    // Filter by search term
    const filtered = term
      ? lecturers.filter(
          (l) =>
            l.keywords.includes(term) ||
            l.name.toLowerCase().includes(term) ||
            l.department.toLowerCase().includes(term)
        )
      : lecturers;

    // Sort by rating and review count
    const sorted = filtered.sort((a, b) => {
      if (b.avgOverall !== a.avgOverall) return b.avgOverall - a.avgOverall;
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
      return b.updatedAt - a.updatedAt;
    });

    // Get campus info for each
    const withCampus = await Promise.all(
      sorted.slice(0, limit).map(async (lecturer) => {
        const campus = await ctx.db.get(lecturer.campusId);
        return {
          id: lecturer._id,
          name: lecturer.name,
          slug: lecturer.slug,
          title: lecturer.title,
          department: lecturer.department,
          photoUrl: lecturer.photoUrl,
          reviewCount: lecturer.reviewCount,
          avgOverall: lecturer.avgOverall,
          avgClarity: lecturer.avgClarity,
          avgFairness: lecturer.avgFairness,
          avgDifficulty: lecturer.avgDifficulty,
          lastReviewSnippet: lecturer.lastReviewSnippet,
          campus: campus
            ? { id: campus._id, name: campus.name, slug: campus.slug }
            : null,
        };
      })
    );

    return withCampus;
  },
});

/**
 * Get lecturer by slug
 */
export const getLecturerBySlug = query({
  args: {
    campusSlug: v.string(),
    lecturerSlug: v.string(),
  },
  handler: async (ctx, args) => {
    // Find campus
    const campus = await ctx.db
      .query("campuses")
      .withIndex("by_slug", (q) => q.eq("slug", args.campusSlug))
      .unique();

    if (!campus) return null;

    // Find lecturer
    const lecturer = await ctx.db
      .query("lecturers")
      .withIndex("by_campus_slug", (q) =>
        q.eq("campusId", campus._id).eq("slug", args.lecturerSlug)
      )
      .unique();

    if (!lecturer) return null;

    // Get reviews
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", lecturer._id))
      .order("desc")
      .take(50);

    // Get review details
    const reviewsWithDetails = await Promise.all(
      reviews
        .filter((r) => !r.isHidden)
        .map(async (r) => {
          const author = r.isAnonymous ? null : await ctx.db.get(r.authorId);
          const course = r.courseId ? await ctx.db.get(r.courseId) : null;

          return {
            id: r._id,
            ratingOverall: r.ratingOverall,
            ratingClarity: r.ratingClarity,
            ratingFairness: r.ratingFairness,
            ratingDifficulty: r.ratingDifficulty,
            comment: r.comment,
            tags: r.tags,
            term: r.term,
            helpfulScore: r.helpfulScore,
            course: course ? { name: course.name, code: course.code } : null,
            author: author
              ? { name: author.name, avatarUrl: author.avatarUrl }
              : null,
            isAnonymous: r.isAnonymous,
            createdAt: r.createdAt,
          };
        })
    );

    return {
      id: lecturer._id,
      name: lecturer.name,
      slug: lecturer.slug,
      title: lecturer.title,
      department: lecturer.department,
      photoUrl: lecturer.photoUrl,
      bio: lecturer.bio,
      reviewCount: lecturer.reviewCount,
      avgOverall: lecturer.avgOverall,
      avgClarity: lecturer.avgClarity,
      avgFairness: lecturer.avgFairness,
      avgDifficulty: lecturer.avgDifficulty,
      campus: {
        id: campus._id,
        name: campus.name,
        slug: campus.slug,
      },
      reviews: reviewsWithDetails,
    };
  },
});

/**
 * Get or create lecturer (used when submitting first review)
 */
export const getOrCreateLecturer = mutation({
  args: {
    campusId: v.id("campuses"),
    name: v.string(),
    department: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const department = args.department.trim();
    const slug = slugify(`${name}-${department}`);

    // Check if lecturer exists
    const existing = await ctx.db
      .query("lecturers")
      .withIndex("by_campus_slug", (q) =>
        q.eq("campusId", args.campusId).eq("slug", slug)
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    // Create new lecturer
    const lecturerId = await ctx.db.insert("lecturers", {
      campusId: args.campusId,
      name,
      slug,
      title: args.title?.trim(),
      department,
      keywords: buildKeywords(name, department, args.title),
      reviewCount: 0,
      avgOverall: 0,
      avgClarity: 0,
      avgFairness: 0,
      avgDifficulty: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return lecturerId;
  },
});

/**
 * Claim lecturer profile (for lecturers who want to manage their profile)
 */
export const claimLecturer = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const lecturer = await ctx.db.get(args.lecturerId);
    if (!lecturer) {
      throw new Error("Lecturer not found");
    }

    if (lecturer.claimedByUserId) {
      throw new Error("Lecturer profile already claimed");
    }

    // Update user role to lecturer
    await ctx.db.patch(args.userId, {
      role: "lecturer",
      updatedAt: Date.now(),
    });

    // Link lecturer profile
    await ctx.db.patch(args.lecturerId, {
      claimedByUserId: args.userId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update lecturer bio (claimed lecturers only)
 */
export const updateLecturerBio = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    bio: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const lecturer = await ctx.db.get(args.lecturerId);
    if (!lecturer) {
      throw new Error("Lecturer not found");
    }

    if (lecturer.claimedByUserId !== args.userId) {
      throw new Error("Unauthorized: You don't own this profile");
    }

    await ctx.db.patch(args.lecturerId, {
      bio: args.bio.trim(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update lecturer aggregates after review
 */
export const updateLecturerAggregates = mutation({
  args: {
    lecturerId: v.id("lecturers"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", args.lecturerId))
      .filter((q) => q.eq(q.field("isHidden"), false))
      .collect();

    if (reviews.length === 0) {
      await ctx.db.patch(args.lecturerId, {
        reviewCount: 0,
        avgOverall: 0,
        avgClarity: 0,
        avgFairness: 0,
        avgDifficulty: 0,
        updatedAt: Date.now(),
      });
      return;
    }

    const sumOverall = reviews.reduce((sum, r) => sum + r.ratingOverall, 0);
    const sumClarity = reviews.reduce(
      (sum, r) => sum + (r.ratingClarity ?? 0),
      0
    );
    const sumFairness = reviews.reduce(
      (sum, r) => sum + (r.ratingFairness ?? 0),
      0
    );
    const sumDifficulty = reviews.reduce(
      (sum, r) => sum + (r.ratingDifficulty ?? 0),
      0
    );

    const clarityCount = reviews.filter((r) => r.ratingClarity != null).length;
    const fairnessCount = reviews.filter((r) => r.ratingFairness != null).length;
    const difficultyCount = reviews.filter((r) => r.ratingDifficulty != null).length;

    // Get latest review snippet
    const latestReview = reviews
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    const snippet = latestReview?.comment?.substring(0, 180);

    await ctx.db.patch(args.lecturerId, {
      reviewCount: reviews.length,
      avgOverall: Number((sumOverall / reviews.length).toFixed(2)),
      avgClarity: clarityCount > 0 ? Number((sumClarity / clarityCount).toFixed(2)) : 0,
      avgFairness: fairnessCount > 0 ? Number((sumFairness / fairnessCount).toFixed(2)) : 0,
      avgDifficulty: difficultyCount > 0 ? Number((sumDifficulty / difficultyCount).toFixed(2)) : 0,
      lastReviewSnippet: snippet,
      updatedAt: Date.now(),
    });
  },
});
