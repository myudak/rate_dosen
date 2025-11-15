export const estimateWouldTakeAgain = (rating: number, difficulty: number) => {
  const score = rating * 18 - difficulty * 8 + 55;
  return Math.max(42, Math.min(99, Math.round(score)));
};

export const qualityColor = (rating: number) => {
  if (rating >= 4) {
    return "bg-emerald-200 text-emerald-900";
  }
  if (rating >= 3) {
    return "bg-amber-200 text-amber-900";
  }
  return "bg-rose-200 text-rose-900";
};

export const formatReviewDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
