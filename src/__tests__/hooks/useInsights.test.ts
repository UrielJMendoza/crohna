import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { useInsights } from "@/hooks/useInsights";
import { insightStats as demoInsightStats } from "@/data/demo";

// Control the SWR response per test instead of hitting the network.
const mockUseSWR = vi.fn();
vi.mock("swr", () => ({
  default: (key: string | null, ...rest: unknown[]) => mockUseSWR(key, ...rest),
}));

type SwrShape = { data: unknown; error: unknown; isLoading: boolean };
function setSwr({ data = undefined, error = undefined, isLoading = false }: Partial<SwrShape>) {
  mockUseSWR.mockReturnValue({ data, error, isLoading, mutate: vi.fn() });
}

const realStats = {
  totalEvents: 12,
  totalPhotos: 4,
  citiesVisited: 3,
  mostActiveYear: 2024,
  mostVisitedCity: "Lisbon",
  topCategory: "Travel",
  longestActiveRun: "5 events",
  categories: [],
  yearlyEvents: [{ year: 2024, count: 12 }],
  cityVisits: [{ city: "Lisbon", count: 5 }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useInsights", () => {
  it("shows demo data to signed-out visitors", () => {
    vi.mocked(useSession).mockReturnValue({ data: null, status: "unauthenticated" } as ReturnType<typeof useSession>);
    setSwr({ data: undefined });

    const { result } = renderHook(() => useInsights());

    expect(result.current.isShowingDemo).toBe(true);
    expect(result.current.stats).toEqual(demoInsightStats);
  });

  it("does NOT fetch insights while the session is still loading", () => {
    vi.mocked(useSession).mockReturnValue({ data: null, status: "loading" } as ReturnType<typeof useSession>);
    setSwr({ data: undefined });

    const { result } = renderHook(() => useInsights());

    // SWR key must be null until the session resolves.
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.anything());
    expect(result.current.isLoading).toBe(true);
  });

  it("shows the authenticated user's real stats", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { email: "a@b.com" } }, status: "authenticated" } as unknown as ReturnType<typeof useSession>);
    setSwr({ data: { stats: realStats } });

    const { result } = renderHook(() => useInsights());

    expect(result.current.isShowingDemo).toBe(false);
    expect(result.current.stats).toEqual(realStats);
  });

  it("does NOT leak demo data to an authenticated user with no events", () => {
    // Regression guard: the API returns { stats: null } for a user with zero
    // events. A signed-in user must NOT be shown demo numbers + a sign-in CTA.
    vi.mocked(useSession).mockReturnValue({ data: { user: { email: "a@b.com" } }, status: "authenticated" } as unknown as ReturnType<typeof useSession>);
    setSwr({ data: { stats: null }, isLoading: false });

    const { result } = renderHook(() => useInsights());

    expect(result.current.isShowingDemo).toBe(false);
    expect(result.current.stats).toBeNull();
  });
});
