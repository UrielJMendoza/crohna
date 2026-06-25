import useSWR from "swr";
import { useSession } from "next-auth/react";
import { insightStats as demoInsightStats } from "@/data/demo";

interface InsightStats {
  totalEvents: number;
  totalPhotos: number;
  citiesVisited: number;
  mostActiveYear: number;
  mostVisitedCity: string;
  topCategory: string;
  longestActiveRun: string;
  categories: { name: string; count: number; color: string }[];
  yearlyEvents: { year: number; count: number }[];
  cityVisits: { city: string; count: number }[];
}

export function useInsights() {
  const { data: session, status } = useSession();
  const isReady = status !== "loading";
  const isAuthenticated = !!session;

  const { data, error, isLoading } = useSWR<{
    stats: InsightStats | null;
  }>(isReady && isAuthenticated ? "/api/insights" : null, {
    dedupingInterval: 10000,
  });

  const stats = data?.stats || null;
  // Only show demo data to signed-out visitors. An authenticated user with no
  // events keeps `stats === null` so the page renders its "No insights yet"
  // empty state — instead of demo numbers and a "Sign in" prompt aimed at
  // someone who is already signed in. Matches useEvents/useStories.
  const isShowingDemo = isReady && !isAuthenticated;
  const displayStats = isShowingDemo ? demoInsightStats : stats;

  return {
    stats: displayStats,
    isLoading: !isReady || (isAuthenticated && isLoading),
    isShowingDemo,
    error,
  };
}
