import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-response";

export type AuthSuccess = {
  ok: true;
  user: { id: string; email: string };
};

export type AuthFailure = {
  ok: false;
  response: ReturnType<typeof apiError>;
};

/**
 * Read the user from the JWT session — no DB lookup. The user.id was
 * populated from token.sub in the session callback (src/lib/auth.ts), which
 * itself was set on first sign-in by PrismaAdapter. Saves a roundtrip on
 * every protected API request.
 */
export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  const email = session?.user?.email;
  if (!id || !email) {
    return { ok: false, response: apiError("Unauthorized", 401) };
  }
  return { ok: true, user: { id, email } };
}
