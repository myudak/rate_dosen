import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const generateToken = () => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};

/**
 * Start email verification process
 */
export const startVerification = mutation({
  args: {
    userId: v.id("users"),
    campusId: v.id("campuses"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const domain = email.split("@")[1];

    if (!domain) {
      throw new Error("Email tidak valid");
    }

    // Get campus
    const campus = await ctx.db.get(args.campusId);
    if (!campus) {
      throw new Error("Campus not found");
    }

    // Check if campus is active
    if (campus.status !== "active") {
      throw new Error("Campus belum aktif. Silakan tunggu persetujuan admin.");
    }

    // Check if email domain matches campus domains
    if (!campus.emailDomains.includes(domain)) {
      throw new Error(
        `Email domain @${domain} tidak sesuai dengan kampus ini. Domain yang diizinkan: ${campus.emailDomains.join(", ")}`
      );
    }

    // Check if already verified
    const existing = await ctx.db
      .query("emailVerifications")
      .withIndex("by_user_campus", (q) =>
        q.eq("userId", args.userId).eq("campusId", args.campusId)
      )
      .unique();

    if (existing && existing.isVerified) {
      throw new Error("Email sudah terverifikasi untuk kampus ini");
    }

    // Generate verification token
    const token = generateToken();
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

    if (existing) {
      // Update existing verification
      await ctx.db.patch(existing._id, {
        email,
        domain,
        token,
        expiresAt,
        createdAt: now,
      });

      return {
        verificationId: existing._id,
        token,
        email,
      };
    }

    // Create new verification
    const verificationId = await ctx.db.insert("emailVerifications", {
      userId: args.userId,
      campusId: args.campusId,
      email,
      domain,
      token,
      isVerified: false,
      createdAt: now,
      expiresAt,
    });

    // TODO: Send verification email
    // This would typically call an external email service
    // For now, we'll return the token for testing

    return {
      verificationId,
      token,
      email,
    };
  },
});

/**
 * Verify email with token
 */
export const verifyEmail = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db
      .query("emailVerifications")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!verification) {
      throw new Error("Token verifikasi tidak valid");
    }

    if (verification.isVerified) {
      throw new Error("Email sudah terverifikasi sebelumnya");
    }

    // Check if token expired
    const now = Date.now();
    if (verification.expiresAt && verification.expiresAt < now) {
      throw new Error("Token verifikasi sudah kadaluarsa. Silakan minta token baru.");
    }

    // Mark as verified
    await ctx.db.patch(verification._id, {
      isVerified: true,
      verifiedAt: now,
      token: undefined, // Clear token after use
    });

    // Get campus info
    const campus = await ctx.db.get(verification.campusId);

    return {
      success: true,
      campus: campus ? { name: campus.name, slug: campus.slug } : null,
    };
  },
});

/**
 * Get user's verified campuses
 */
export const getUserVerifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const verifications = await ctx.db
      .query("emailVerifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const withCampus = await Promise.all(
      verifications.map(async (v) => {
        const campus = await ctx.db.get(v.campusId);
        return {
          id: v._id,
          email: v.email,
          domain: v.domain,
          isVerified: v.isVerified,
          verifiedAt: v.verifiedAt,
          campus: campus
            ? {
                id: campus._id,
                name: campus.name,
                slug: campus.slug,
              }
            : null,
        };
      })
    );

    return withCampus;
  },
});

/**
 * Check if user is verified for a campus
 */
export const isUserVerifiedForCampus = query({
  args: {
    userId: v.id("users"),
    campusId: v.id("campuses"),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db
      .query("emailVerifications")
      .withIndex("by_user_campus", (q) =>
        q.eq("userId", args.userId).eq("campusId", args.campusId)
      )
      .filter((q) => q.eq(q.field("isVerified"), true))
      .unique();

    return {
      isVerified: !!verification,
      email: verification?.email,
      verifiedAt: verification?.verifiedAt,
    };
  },
});

/**
 * Resend verification email
 */
export const resendVerification = mutation({
  args: {
    userId: v.id("users"),
    campusId: v.id("campuses"),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db
      .query("emailVerifications")
      .withIndex("by_user_campus", (q) =>
        q.eq("userId", args.userId).eq("campusId", args.campusId)
      )
      .unique();

    if (!verification) {
      throw new Error("Verifikasi tidak ditemukan");
    }

    if (verification.isVerified) {
      throw new Error("Email sudah terverifikasi");
    }

    // Generate new token
    const token = generateToken();
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

    await ctx.db.patch(verification._id, {
      token,
      expiresAt,
      createdAt: now,
    });

    // TODO: Send verification email

    return {
      success: true,
      token,
      email: verification.email,
    };
  },
});
