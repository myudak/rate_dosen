import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Create a review (requires email verification for campus)
 */
export const createReview = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    courseId: v.optional(v.id("courses")),
    userId: v.id("users"),
    ratingOverall: v.number(),
    ratingClarity: v.optional(v.number()),
    ratingFairness: v.optional(v.number()),
    ratingDifficulty: v.optional(v.number()),
    comment: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    term: v.optional(v.string()),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Get lecturer to find campus
    const lecturer = await ctx.db.get(args.lecturerId);
    if (!lecturer) {
      throw new Error("Lecturer not found");
    }

    // Check if user is verified for this campus
    const verification = await ctx.db
      .query("emailVerifications")
      .withIndex("by_user_campus", (q) =>
        q.eq("userId", args.userId).eq("campusId", lecturer.campusId)
      )
      .filter((q) => q.eq(q.field("isVerified"), true))
      .unique();

    if (!verification) {
      throw new Error(
        "You must verify your campus email before leaving a review"
      );
    }

    // Check if user already reviewed this lecturer
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", args.lecturerId))
      .filter((q) => q.eq(q.field("authorId"), args.userId))
      .unique();

    if (existingReview) {
      throw new Error("You have already reviewed this lecturer");
    }

    // Clamp ratings to 1-5
    const ratingOverall = clamp(args.ratingOverall, 1, 5);
    const ratingClarity = args.ratingClarity
      ? clamp(args.ratingClarity, 1, 5)
      : undefined;
    const ratingFairness = args.ratingFairness
      ? clamp(args.ratingFairness, 1, 5)
      : undefined;
    const ratingDifficulty = args.ratingDifficulty
      ? clamp(args.ratingDifficulty, 1, 5)
      : undefined;

    // Create review
    const reviewId = await ctx.db.insert("reviews", {
      campusId: lecturer.campusId,
      lecturerId: args.lecturerId,
      courseId: args.courseId,
      authorId: args.userId,
      ratingOverall,
      ratingClarity,
      ratingFairness,
      ratingDifficulty,
      comment: args.comment?.trim(),
      tags: (args.tags ?? []).map((t) => t.trim().toLowerCase()),
      term: args.term?.trim(),
      isAnonymous: args.isAnonymous,
      isReported: false,
      isHidden: false,
      helpfulScore: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update lecturer aggregates
    await ctx.runMutation(api.lecturers.updateLecturerAggregates, {
      lecturerId: args.lecturerId,
    });

    return { reviewId, success: true };
  },
});

/**
 * Vote on review (helpful/not helpful)
 */
export const voteOnReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    userId: v.id("users"),
    value: v.number(), // +1 or -1
  },
  handler: async (ctx, args) => {
    // Check if user already voted
    const existingVote = await ctx.db
      .query("reviewVotes")
      .withIndex("by_user_review", (q) =>
        q.eq("userId", args.userId).eq("reviewId", args.reviewId)
      )
      .unique();

    if (existingVote) {
      // Update existing vote
      await ctx.db.patch(existingVote._id, {
        value: args.value === 1 ? 1 : -1,
      });
    } else {
      // Create new vote
      await ctx.db.insert("reviewVotes", {
        reviewId: args.reviewId,
        userId: args.userId,
        value: args.value === 1 ? 1 : -1,
        createdAt: Date.now(),
      });
    }

    // Update review's helpful score
    const votes = await ctx.db
      .query("reviewVotes")
      .withIndex("by_review", (q) => q.eq("reviewId", args.reviewId))
      .collect();

    const score = votes.reduce((sum, v) => sum + v.value, 0);

    await ctx.db.patch(args.reviewId, {
      helpfulScore: score,
      updatedAt: Date.now(),
    });

    return { success: true, newScore: score };
  },
});

/**
 * Report review
 */
export const reportReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reviewId, {
      isReported: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Hide review (admin only)
 */
export const hideReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    adminAuthId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.adminAuthId))
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    await ctx.db.patch(args.reviewId, {
      isHidden: true,
      updatedAt: Date.now(),
    });

    // Update lecturer aggregates
    await ctx.runMutation(api.lecturers.updateLecturerAggregates, {
      lecturerId: review.lecturerId,
    });

    return { success: true };
  },
});

/**
 * Get reported reviews (admin only)
 */
export const getReportedReviews = query({
  args: { adminAuthId: v.string() },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.adminAuthId))
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const reported = await ctx.db
      .query("reviews")
      .filter((q) =>
        q.and(q.eq(q.field("isReported"), true), q.eq(q.field("isHidden"), false))
      )
      .collect();

    const withDetails = await Promise.all(
      reported.map(async (review) => {
        const lecturer = await ctx.db.get(review.lecturerId);
        const author = await ctx.db.get(review.authorId);
        const campus = await ctx.db.get(review.campusId);

        return {
          id: review._id,
          comment: review.comment,
          ratingOverall: review.ratingOverall,
          lecturer: lecturer
            ? { name: lecturer.name, slug: lecturer.slug }
            : null,
          campus: campus ? { name: campus.name, slug: campus.slug } : null,
          author: author
            ? { name: author.name, email: author.email }
            : null,
          createdAt: review.createdAt,
        };
      })
    );

    return withDetails;
  },
});

/**
 * Get user's reviews
 */
export const getUserReviews = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .order("desc")
      .collect();

    const withDetails = await Promise.all(
      reviews.map(async (review) => {
        const lecturer = await ctx.db.get(review.lecturerId);
        const campus = await ctx.db.get(review.campusId);
        const course = review.courseId
          ? await ctx.db.get(review.courseId)
          : null;

        return {
          id: review._id,
          ratingOverall: review.ratingOverall,
          ratingClarity: review.ratingClarity,
          ratingFairness: review.ratingFairness,
          ratingDifficulty: review.ratingDifficulty,
          comment: review.comment,
          tags: review.tags,
          term: review.term,
          helpfulScore: review.helpfulScore,
          isAnonymous: review.isAnonymous,
          isHidden: review.isHidden,
          lecturer: lecturer
            ? { name: lecturer.name, slug: lecturer.slug }
            : null,
          campus: campus ? { name: campus.name, slug: campus.slug } : null,
          course: course ? { name: course.name, code: course.code } : null,
          createdAt: review.createdAt,
        };
      })
    );

    return withDetails;
  },
});

// Import API for internal mutations
import { api } from "./_generated/api";
