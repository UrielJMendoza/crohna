import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { validateCsrf } from "@/lib/csrf";
import { updateUserSchema, deleteAccountSchema, parseBody } from "@/lib/validation";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/api-auth";

// GET /api/user — get user profile and preferences (needs full DB row for preferences/image)
export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        preferences: user.preferences ?? {},
      },
    });
  } catch (error) {
    logger.error("GET /api/user error", { error: String(error) });
    return apiError("Failed to fetch user", 500);
  }
}

// PUT /api/user — update user profile
export async function PUT(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { data: body, error: validationError } = await parseBody(req, updateUserSchema);
    if (validationError) return validationError;

    const { name, preferences } = body;

    const prisma = getPrisma();
    const user = await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        ...(name !== undefined && { name: name?.trim() || null }),
        ...(preferences !== undefined && { preferences: preferences as Prisma.InputJsonValue }),
      },
    });

    return apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        preferences: user.preferences ?? {},
      },
    });
  } catch (error) {
    logger.error("PUT /api/user error", { error: String(error) });
    return apiError("Failed to update profile", 500);
  }
}

// DELETE /api/user — delete user account and all associated data
export async function DELETE(req: NextRequest) {
  try {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const auth = await requireAuth();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    // Require explicit confirmation to prevent accidental deletion
    const { error: validationError } = await parseBody(req, deleteAccountSchema);
    if (validationError) return validationError;

    const prisma = getPrisma();

    // Cascading FKs would handle this, but we're explicit so the order is auditable.
    await prisma.$transaction([
      prisma.aIStory.deleteMany({ where: { userId: user.id } }),
      prisma.event.deleteMany({ where: { userId: user.id } }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
      prisma.account.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);

    return apiSuccess({});
  } catch (error) {
    logger.error("DELETE /api/user error", { error: String(error) });
    return apiError("Failed to delete account", 500);
  }
}
