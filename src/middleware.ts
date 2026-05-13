import { NextRequest, NextResponse } from "next/server";

function validateCsrfInMiddleware(req: NextRequest): NextResponse | null {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return null;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (!origin && !referer) {
    return NextResponse.json(
      { error: "Forbidden: missing origin header" },
      { status: 403 }
    );
  }

  const allowedHost = req.nextUrl.host;

  const headerToCheck = origin || referer;
  if (headerToCheck) {
    try {
      const parsedHost = new URL(headerToCheck).host;
      if (parsedHost !== allowedHost) {
        return NextResponse.json(
          { error: "Forbidden: cross-origin request" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Forbidden: invalid origin" },
        { status: 403 }
      );
    }
  }

  return null;
}

/**
 * Build a per-request CSP value with a nonce. Next.js auto-tags its inline
 * scripts with this nonce when we set the `x-nonce` request header, which
 * lets us drop `'unsafe-inline'` from script-src — the original CSP made
 * XSS protection theatre.
 *
 * style-src keeps `'unsafe-inline'` because Tailwind / framer-motion emit
 * inline styles via the `style` attribute, which is much lower-risk than
 * inline scripts.
 */
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: *.supabase.co lh3.googleusercontent.com *.basemaps.cartocdn.com images.unsplash.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://fonts.googleapis.com https://fonts.gstatic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ") + ";";
}

export async function middleware(req: NextRequest) {
  try {
    // CSRF defense-in-depth on mutating API requests (no-op for GET/HEAD/OPTIONS,
    // and the matcher excludes /api/auth/*).
    const csrfError = validateCsrfInMiddleware(req);
    if (csrfError) return csrfError;

    // Generate a fresh nonce per request so Next.js can tag its inline scripts.
    // crypto.randomUUID is available in the Edge runtime.
    const nonce = btoa(crypto.randomUUID());
    const csp = buildCsp(nonce);

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("Content-Security-Policy", csp);
    return response;
  } catch {
    // Never let the Edge function throw — that produces MIDDLEWARE_INVOCATION_FAILED.
    return NextResponse.next();
  }
}

// Match every request EXCEPT:
//   - Next.js framework assets (_next/static, _next/image)
//   - The favicon
//   - NextAuth's own routes (/api/auth/*) — it handles CSRF itself
//   - The health endpoint (/api/health) — must be reachable unauthenticated
//   - Prefetch requests (no need to set CSP, and avoids needless work)
export const config = {
  matcher: [
    {
      // Negative lookaheads use trailing `/` or `$` so /api/authentication and
      // /api/healthy still match (they aren't NextAuth or the health endpoint).
      source: "/((?!_next/static/|_next/image|favicon.ico|api/auth/|api/auth$|api/health/|api/health$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
