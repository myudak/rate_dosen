import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

/**
 * List all active campuses
 */
export const listCampuses = query({
  args: {
    includeStats: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const campuses = await ctx.db
      .query("campuses")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    if (!args.includeStats) {
      return campuses.map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug,
        city: c.city,
        type: c.type,
        logoUrl: c.logoUrl,
      }));
    }

    // Include statistics
    const withStats = await Promise.all(
      campuses.map(async (campus) => {
        const lecturers = await ctx.db
          .query("lecturers")
          .withIndex("by_campus", (q) => q.eq("campusId", campus._id))
          .collect();

        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_campus", (q) => q.eq("campusId", campus._id))
          .collect();

        return {
          id: campus._id,
          name: campus.name,
          slug: campus.slug,
          city: campus.city,
          type: campus.type,
          logoUrl: campus.logoUrl,
          description: campus.description,
          lecturerCount: lecturers.length,
          reviewCount: reviews.length,
          avgQuality:
            lecturers.length > 0
              ? lecturers.reduce((sum, l) => sum + l.avgOverall, 0) /
                lecturers.length
              : 0,
        };
      })
    );

    return withStats.sort((a, b) => b.reviewCount - a.reviewCount);
  },
});

/**
 * Get campus by slug
 */
export const getCampusBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const campus = await ctx.db
      .query("campuses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!campus) return null;

    // Get top lecturers
    const lecturers = await ctx.db
      .query("lecturers")
      .withIndex("by_campus", (q) => q.eq("campusId", campus._id))
      .collect();

    const topLecturers = lecturers
      .sort((a, b) => {
        if (b.avgOverall !== a.avgOverall) return b.avgOverall - a.avgOverall;
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, 10)
      .map((l) => ({
        id: l._id,
        name: l.name,
        slug: l.slug,
        department: l.department,
        avgOverall: l.avgOverall,
        reviewCount: l.reviewCount,
      }));

    // Get recent reviews
    const recentReviews = await ctx.db
      .query("reviews")
      .withIndex("by_campus", (q) => q.eq("campusId", campus._id))
      .order("desc")
      .take(10);

    const reviewsWithDetails = await Promise.all(
      recentReviews.map(async (r) => {
        const lecturer = await ctx.db.get(r.lecturerId);
        const author = r.isAnonymous ? null : await ctx.db.get(r.authorId);

        return {
          id: r._id,
          lecturer: lecturer ? { name: lecturer.name, slug: lecturer.slug } : null,
          ratingOverall: r.ratingOverall,
          comment: r.comment?.substring(0, 200),
          author: author ? { name: author.name, avatarUrl: author.avatarUrl } : null,
          isAnonymous: r.isAnonymous,
          createdAt: r.createdAt,
        };
      })
    );

    return {
      id: campus._id,
      name: campus.name,
      slug: campus.slug,
      city: campus.city,
      type: campus.type,
      website: campus.website,
      description: campus.description,
      logoUrl: campus.logoUrl,
      emailDomains: campus.emailDomains,
      status: campus.status,
      lecturerCount: lecturers.length,
      topLecturers,
      recentReviews: reviewsWithDetails,
    };
  },
});

/**
 * Submit new campus (pending approval)
 */
export const submitCampus = mutation({
  args: {
    name: v.string(),
    city: v.optional(v.string()),
    type: v.optional(v.string()),
    website: v.optional(v.string()),
    suggestedDomain: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const slug = slugify(args.name);

    // Check if campus already exists
    const existing = await ctx.db
      .query("campuses")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (existing) {
      throw new Error("Campus dengan nama ini sudah ada");
    }

    const campusId = await ctx.db.insert("campuses", {
      name: args.name.trim(),
      slug,
      city: args.city?.trim(),
      type: args.type?.trim(),
      website: args.website?.trim(),
      emailDomains: [args.suggestedDomain.toLowerCase().trim()],
      status: "pending",
      submittedByUserId: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { id: campusId, slug };
  },
});

/**
 * Approve campus (admin only)
 */
export const approveCampus = mutation({
  args: {
    campusId: v.id("campuses"),
    emailDomains: v.array(v.string()),
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

    await ctx.db.patch(args.campusId, {
      emailDomains: args.emailDomains.map((d) => d.toLowerCase().trim()),
      status: "active",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Reject campus (admin only)
 */
export const rejectCampus = mutation({
  args: {
    campusId: v.id("campuses"),
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

    await ctx.db.patch(args.campusId, {
      status: "rejected",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get pending campuses (admin only)
 */
export const getPendingCampuses = query({
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

    const pending = await ctx.db
      .query("campuses")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const withSubmitter = await Promise.all(
      pending.map(async (campus) => {
        const submitter = campus.submittedByUserId
          ? await ctx.db.get(campus.submittedByUserId)
          : null;

        return {
          id: campus._id,
          name: campus.name,
          slug: campus.slug,
          city: campus.city,
          type: campus.type,
          website: campus.website,
          emailDomains: campus.emailDomains,
          submittedBy: submitter
            ? { name: submitter.name, email: submitter.email }
            : null,
          createdAt: campus.createdAt,
        };
      })
    );

    return withSubmitter;
  },
});

/**
 * Search campuses
 */
export const searchCampuses = query({
  args: {
    term: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const term = args.term.toLowerCase().trim();
    const limit = args.limit ?? 10;

    const all = await ctx.db
      .query("campuses")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const filtered = all.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.includes(term) ||
        c.city?.toLowerCase().includes(term)
    );

    return filtered.slice(0, limit).map((c) => ({
      id: c._id,
      name: c.name,
      slug: c.slug,
      city: c.city,
      type: c.type,
    }));
  },
});
