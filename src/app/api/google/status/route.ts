import { getPrisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/api-auth";

// GET /api/google/status — check which Google services have imported data
export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const prisma = getPrisma();

    const [calendarCount, photosCount] = await Promise.all([
      prisma.event.count({ where: { userId: user.id, source: "calendar" } }),
      prisma.event.count({ where: { userId: user.id, source: "photos" } }),
    ]);

    return apiSuccess({
      calendar: calendarCount > 0,
      photos: photosCount > 0,
    });
  } catch (error) {
    logger.error("GET /api/google/status error", { error: String(error) });
    return apiError("Failed to check status", 500);
  }
}
