import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/stories/[id]/share/route";
import { getServerSession } from "next-auth";
import { mockPrisma } from "../setup";
import { NextRequest } from "next/server";

const mockSession = { user: { email: "test@example.com" } };
const mockUser = { id: "user-1", email: "test@example.com" };
const mockStory = {
  id: "story-1",
  title: "Your 2024",
  period: "January – December 2024",
  year: 2024,
  summary: "A year of meaningful change.",
  highlights: ["Highlight 1", "Highlight 2"],
  stats: { events: 10, cities: 3, photos: 7, mostVisitedCity: "Paris" },
  userId: "user-1",
};

function makeRequest() {
  return new NextRequest(new URL("/api/stories/story-1/share", "http://localhost:3000"), {
    method: "GET",
    headers: { origin: "http://localhost:3000" },
  });
}

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/stories/[id]/share", () => {
  it("returns 401 for unauthenticated users", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await GET(makeRequest(), makeParams("story-1"));

    expect(res.status).toBe(401);
  });

  it("returns 403 when shareableStories is disabled", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique
      // First call: route handler resolves the user id.
      .mockResolvedValueOnce(mockUser)
      // Second call: getUserPreferences pulls the preferences.
      .mockResolvedValueOnce({ preferences: { shareableStories: false } });

    const res = await GET(makeRequest(), makeParams("story-1"));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toMatch(/sharing is disabled/i);
    // Story lookup must not happen once sharing is denied.
    expect(mockPrisma.aIStory.findFirst).not.toHaveBeenCalled();
  });

  it("returns full payload when both prefs are enabled (defaults)", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ preferences: {} });
    mockPrisma.aIStory.findFirst.mockResolvedValue(mockStory);

    const res = await GET(makeRequest(), makeParams("story-1"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.share.title).toBe("Your 2024");
    expect(data.share.content).toBe("A year of meaningful change.");
    expect(data.share.stats).toEqual({ events: 10, cities: 3, photos: 7, mostVisitedCity: "Paris" });
    expect(data.share.allowLocation).toBe(true);
    expect(data.share.type).toBe("year-review");
  });

  it("strips location-derived stats when showLocationOnShared is false", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ preferences: { shareableStories: true, showLocationOnShared: false } });
    mockPrisma.aIStory.findFirst.mockResolvedValue(mockStory);

    const res = await GET(makeRequest(), makeParams("story-1"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.share.allowLocation).toBe(false);
    expect(data.share.stats).toEqual({ events: 10, photos: 7 });
    expect(data.share.stats.cities).toBeUndefined();
    expect(data.share.stats.mostVisitedCity).toBeUndefined();
  });

  it("returns 404 when the story does not belong to the user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ preferences: {} });
    mockPrisma.aIStory.findFirst.mockResolvedValue(null);

    const res = await GET(makeRequest(), makeParams("not-mine"));

    expect(res.status).toBe(404);
  });
});
