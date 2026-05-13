import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";
import { getUserPreferences } from "@/lib/preferences";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const checkShareLimit = createRateLimiter("story-share", 30, 60_000);

// GET /api/stories/[id]/share — return a story payload sanitized per the
// owner's privacy preferences. The settings page toggles drive what this
// endpoint returns; the share UI must use this payload (not the raw story)
// so the server stays the source of truth for what can leave the app.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    if (!(await checkShareLimit(session.user.email)).allowed) {
      return apiError("Too many requests. Please wait a minute.", 429);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return apiError("User not found", 404);
    }

    const { id } = await params;

    const prefs = await getUserPreferences(user.id);
    if (prefs.shareableStories === false) {
      return apiError(
        "Sharing is disabled for this account. Enable it in Settings → Privacy.",
        403
      );
    }

    const story = await prisma.aIStory.findFirst({
      where: { id, userId: user.id },
    });
    if (!story) {
      return apiError("Story not found", 404);
    }

    // Strip location-derived fields when the user opted out of including
    // location data in shared content.
    const rawStats = (story.stats ?? null) as Record<string, string | number> | null;
    let sharedStats: Record<string, string | number> | undefined;
    if (rawStats) {
      sharedStats = { ...rawStats };
      if (prefs.showLocationOnShared === false) {
        delete sharedStats.cities;
        delete sharedStats.mostVisitedCity;
        delete sharedStats.location;
      }
    }

    return apiSuccess({
      share: {
        id: story.id,
        type: story.year ? "year-review" : "story",
        title: story.title,
        content: story.summary,
        highlights: story.highlights,
        stats: sharedStats,
        allowLocation: prefs.showLocationOnShared !== false,
      },
    });
  } catch (error) {
    logger.error("GET /api/stories/[id]/share error", { error: String(error) });
    return apiError("Failed to load share payload", 500);
  }
}
