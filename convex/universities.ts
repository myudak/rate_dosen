import { query } from "./_generated/server";
import { ALLOWED_UNIVERSITIES } from "./constants";
import { Id } from "./_generated/dataModel";

type UniversityDoc = {
  _id: Id<"universities">;
  name: string;
  slug: string;
  createdAt: number;
};

export const listUniversities = query({
  handler: async (ctx) => {
    const universities = (await ctx.db
      .query("universities")
      .collect()) as UniversityDoc[];

    const results = await Promise.all(
      universities.map(async (uni) => {
        const dosenList = await ctx.db
          .query("dosen")
          .withIndex("by_university", (q) => q.eq("universityId", uni._id))
          .collect();

        const reviewCount = dosenList.reduce(
          (sum, doc: any) => sum + doc.ratingCount,
          0
        );
        const weightedQuality = dosenList.reduce((sum, doc: any) => {
          return sum + doc.averageRating * doc.ratingCount;
        }, 0);
        const averageQuality = reviewCount
          ? Number((weightedQuality / reviewCount).toFixed(2))
          : 0;

        return {
          id: uni._id,
          name: uni.name,
          slug: uni.slug,
          dosenCount: dosenList.length,
          reviewCount,
          averageQuality,
        };
      })
    );

    return results.sort((a, b) => b.reviewCount - a.reviewCount);
  },
});
