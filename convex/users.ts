import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get or create user from auth session
 * Called when user logs in via Better Auth
 */
export const getOrCreateUser = mutation({
  args: {
    authId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .unique();

    if (existing) {
      // Update user info if changed
      await ctx.db.patch(existing._id, {
        email: args.email ?? existing.email,
        name: args.name ?? existing.name,
        avatarUrl: args.avatarUrl ?? existing.avatarUrl,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      authId: args.authId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      role: "student", // Default role
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Get current user by auth ID
 */
export const getCurrentUser = query({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .unique();

    if (!user) return null;

    // Get verified campuses
    const verifications = await ctx.db
      .query("emailVerifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isVerified"), true))
      .collect();

    const verifiedCampuses = await Promise.all(
      verifications.map(async (v) => {
        const campus = await ctx.db.get(v.campusId);
        return campus
          ? { id: campus._id, name: campus.name, slug: campus.slug }
          : null;
      })
    );

    return {
      id: user._id,
      authId: user.authId,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      verifiedCampuses: verifiedCampuses.filter(Boolean),
      createdAt: user.createdAt,
    };
  },
});

/**
 * Update user role (admin only)
 */
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("student"), v.literal("lecturer"), v.literal("admin")),
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

    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get user profile by ID
 */
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Get user's reviews
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .collect();

    // Get verified campuses
    const verifications = await ctx.db
      .query("emailVerifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isVerified"), true))
      .collect();

    return {
      id: user._id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      reviewCount: reviews.length,
      verifiedCampusCount: verifications.length,
      createdAt: user.createdAt,
    };
  },
});
