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

// Base64-encode a random 16-byte buffer using only Web APIs (Edge runtime safe).
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function buildCspHeader(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: *.supabase.co lh3.googleusercontent.com *.basemaps.cartocdn.com images.unsplash.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://fonts.googleapis.com https://fonts.gstatic.com",
    "frame-ancestors 'none'",
  ].join("; ") + ";";
}

export async function middleware(req: NextRequest) {
  try {
    const csrfError = validateCsrfInMiddleware(req);
    if (csrfError) return csrfError;

    // Apply nonce-based CSP only to page requests. API routes get a stricter
    // policy without nonces since they return JSON, not HTML.
    const isApiRoute = req.nextUrl.pathname.startsWith("/api/");

    if (isApiRoute) {
      return NextResponse.next();
    }

    const nonce = generateNonce();

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);

    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("Content-Security-Policy", buildCspHeader(nonce));
    return res;
  } catch {
    // Never let the Edge function throw — that produces
    // MIDDLEWARE_INVOCATION_FAILED, which broke the OAuth flow. Fail open
    // and let the route handler enforce auth via getServerSession().
    return NextResponse.next();
  }
}

// Run middleware on:
//   - page routes (to apply nonce-based CSP for XSS defense)
//   - /api/* routes except /api/auth/* and /api/health (for CSRF defense)
//
// Excluded:
//   - /api/auth/* (NextAuth handles its own flow including CSRF)
//   - /api/health (public health check)
//   - /_next/* (static assets and image optimizer)
//   - favicon, manifest, theme-init.js, icon-*.png (public static files)
//
// `auth$` and `health$` (instead of just `auth` and `health`) avoid matching
// lookalikes like /api/authentication or /api/healthy.
export const config = {
  matcher: [
    "/((?!api/auth/|api/auth$|api/health/|api/health$|_next/|favicon\\.ico$|theme-init\\.js$|manifest\\.json$|icon-.+\\.png$|opengraph-image).*)",
  ],
};
