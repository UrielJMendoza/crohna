import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { validateCsrf } from "@/lib/csrf";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/api-auth";

// POST /api/events/[id]/restore — restore a soft-deleted event
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const { id } = await params;
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const prisma = getPrisma();

    const existing = await prisma.event.findFirst({
      where: { id, userId: user.id, deletedAt: { not: null } },
    });
    if (!existing) {
      return apiError("Event not found or not deleted", 404);
    }

    await prisma.event.update({ where: { id }, data: { deletedAt: null } });

    return apiSuccess({ restored: true });
  } catch (error) {
    logger.error("POST /api/events/[id]/restore error", { error: String(error) });
    return apiError("Failed to restore event", 500);
  }
}
