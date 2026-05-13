import { getPrisma } from "@/lib/prisma";
import type { UserPreferences } from "@/lib/validation";

const DEFAULT_PREFERENCES: Required<Pick<UserPreferences, "shareableStories" | "showLocationOnShared">> = {
  shareableStories: true,
  showLocationOnShared: true,
};

/**
 * Resolve a user's privacy preferences with sensible defaults filled in.
 * Returns the canonical shape regardless of what's persisted — never `undefined`
 * for the privacy-related keys, so callers can branch without nullish-checks.
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });
  const raw = (user?.preferences ?? {}) as Record<string, unknown>;
  return {
    ...DEFAULT_PREFERENCES,
    ...raw,
    shareableStories:
      typeof raw.shareableStories === "boolean"
        ? raw.shareableStories
        : DEFAULT_PREFERENCES.shareableStories,
    showLocationOnShared:
      typeof raw.showLocationOnShared === "boolean"
        ? raw.showLocationOnShared
        : DEFAULT_PREFERENCES.showLocationOnShared,
  };
}
