import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create community post
 */
export const createPost = mutation({
  args: {
    campusId: v.id("campuses"),
    authorId: v.id("users"),
    title: v.string(),
    body: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user is verified for this campus
    const verification = await ctx.db
      .query("emailVerifications")
      .withIndex("by_user_campus", (q) =>
        q.eq("userId", args.authorId).eq("campusId", args.campusId)
      )
      .filter((q) => q.eq(q.field("isVerified"), true))
      .unique();

    if (!verification) {
      throw new Error(
        "You must verify your campus email before posting"
      );
    }

    const postId = await ctx.db.insert("communityPosts", {
      campusId: args.campusId,
      authorId: args.authorId,
      title: args.title.trim(),
      body: args.body.trim(),
      category: args.category?.trim(),
      isReported: false,
      isHidden: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { postId, success: true };
  },
});

/**
 * Get campus posts
 */
export const getCampusPosts = query({
  args: {
    campusId: v.id("campuses"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const posts = await ctx.db
      .query("communityPosts")
      .withIndex("by_campus", (q) => q.eq("campusId", args.campusId))
      .filter((q) => q.eq(q.field("isHidden"), false))
      .order("desc")
      .take(limit);

    const withAuthor = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        return {
          id: post._id,
          title: post.title,
          body: post.body,
          category: post.category,
          author: author
            ? { name: author.name, avatarUrl: author.avatarUrl }
            : null,
          commentCount: comments.length,
          createdAt: post.createdAt,
        };
      })
    );

    return withAuthor;
  },
});

/**
 * Get single post with comments
 */
export const getPost = query({
  args: { postId: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post || post.isHidden) return null;

    const author = await ctx.db.get(post.authorId);
    const campus = await ctx.db.get(post.campusId);

    // Get comments
    const allComments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("isHidden"), false))
      .collect();

    const commentsWithAuthor = await Promise.all(
      allComments.map(async (comment) => {
        const commentAuthor = await ctx.db.get(comment.authorId);
        return {
          id: comment._id,
          body: comment.body,
          author: commentAuthor
            ? { name: commentAuthor.name, avatarUrl: commentAuthor.avatarUrl }
            : null,
          parentCommentId: comment.parentCommentId,
          createdAt: comment.createdAt,
        };
      })
    );

    return {
      id: post._id,
      title: post.title,
      body: post.body,
      category: post.category,
      author: author
        ? { name: author.name, avatarUrl: author.avatarUrl }
        : null,
      campus: campus
        ? { name: campus.name, slug: campus.slug }
        : null,
      comments: commentsWithAuthor,
      createdAt: post.createdAt,
    };
  },
});

/**
 * Add comment to post or review
 */
export const addComment = mutation({
  args: {
    postId: v.optional(v.id("communityPosts")),
    reviewId: v.optional(v.id("reviews")),
    authorId: v.id("users"),
    body: v.string(),
    parentCommentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    if (!args.postId && !args.reviewId) {
      throw new Error("Must provide either postId or reviewId");
    }

    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      reviewId: args.reviewId,
      authorId: args.authorId,
      body: args.body.trim(),
      parentCommentId: args.parentCommentId,
      isReported: false,
      isHidden: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { commentId, success: true };
  },
});

/**
 * Report post
 */
export const reportPost = mutation({
  args: {
    postId: v.id("communityPosts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      isReported: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Hide post (admin only)
 */
export const hidePost = mutation({
  args: {
    postId: v.id("communityPosts"),
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

    await ctx.db.patch(args.postId, {
      isHidden: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
