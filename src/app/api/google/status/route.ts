import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const checkStatusLimit = createRateLimiter("google-status", 30, 60_000);

// GET /api/google/status — check which Google services have imported data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    if (!(await checkStatusLimit(session.user.email)).allowed) {
      return apiError("Too many requests. Please wait a minute.", 429);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

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
