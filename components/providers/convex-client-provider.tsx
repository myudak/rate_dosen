"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { PropsWithChildren, useMemo } from "react";

type ConvexClientProviderProps = PropsWithChildren<{
  url?: string;
}>;

export function ConvexClientProvider({
  url,
  children,
}: ConvexClientProviderProps) {
  const client = useMemo(() => {
    if (!url) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Convex URL belum dikonfigurasi.");
      }
      return null;
    }
    return new ConvexReactClient(url);
  }, [url]);

  if (!client) {
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
