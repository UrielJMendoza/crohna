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

// Build a strict CSP using a per-request nonce. 'strict-dynamic' makes browsers
// honor only nonced/hashed scripts, so legacy 'unsafe-inline' is ignored on
// modern browsers; we keep it as a CSP1 fallback for very old user agents.
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: *.supabase.co lh3.googleusercontent.com *.basemaps.cartocdn.com images.unsplash.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://fonts.googleapis.com https://fonts.gstatic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function middleware(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;

    // API routes: enforce CSRF defense-in-depth, no CSP needed (JSON responses).
    if (pathname.startsWith("/api/")) {
      const csrfError = validateCsrfInMiddleware(req);
      if (csrfError) return csrfError;
      return NextResponse.next();
    }

    // HTML pages: attach a fresh per-request CSP nonce. Next.js auto-applies
    // this nonce to its framework inline scripts; layout.tsx forwards it to
    // the theme-init <script>.
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    let raw = "";
    for (let i = 0; i < randomBytes.length; i++) raw += String.fromCharCode(randomBytes[i]);
    const nonce = btoa(raw);
    const csp = buildCsp(nonce);

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("content-security-policy", csp);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("Content-Security-Policy", csp);
    return response;
  } catch {
    // Never let the Edge function throw — that produces
    // MIDDLEWARE_INVOCATION_FAILED, which broke the OAuth flow. Fail open
    // and let the route handler enforce auth via getServerSession().
    return NextResponse.next();
  }
}

// Match:
//   - all API routes except /api/auth/* (NextAuth handles its own flow) and
//     /api/health (lightweight liveness probe — must stay unauthenticated).
//   - all page routes except Next.js static assets and favicon, so we can
//     attach a CSP nonce.
export const config = {
  matcher: [
    "/api/((?!auth/|auth$|health/|health$).*)",
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
