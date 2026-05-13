import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { validateCsrf } from "@/lib/csrf";
import { createRateLimiter } from "@/lib/rate-limit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const checkDisconnectLimit = createRateLimiter("google-disconnect", 5, 60_000);

const VALID_SOURCES = ["calendar", "photos"] as const;
type Source = (typeof VALID_SOURCES)[number];

// POST /api/google/disconnect — removes all imported events for a given source
export async function POST(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    if (!(await checkDisconnectLimit(userId)).allowed) {
      return apiError("Too many requests. Please wait a minute.", 429);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const source = (body as { source?: string } | null)?.source;
    if (!source || !VALID_SOURCES.includes(source as Source)) {
      return apiError("Invalid source. Must be 'calendar' or 'photos'.", 400);
    }

    const prisma = getPrisma();
    const result = await prisma.event.deleteMany({
      where: { userId, source },
    });

    return apiSuccess({ deleted: result.count });
  } catch (error) {
    logger.error("POST /api/google/disconnect error", { error: String(error) });
    return apiError("Failed to disconnect", 500);
  }
}
