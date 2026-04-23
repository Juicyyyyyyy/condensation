import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/refresh-token";

/**
 * Server Components can't write cookies, so they can't perform a token
 * refresh themselves. When a Server Component detects that the current
 * session needs refreshing (`resolveAdminAuth` returning `needs_refresh`),
 * it redirects the user here. This is a Route Handler, so cookie writes
 * work normally — we refresh, persist the rotated tokens, and bounce the
 * browser back to the original URL so the page re-renders with a valid
 * session.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawReturn = url.searchParams.get("return") ?? "/";
  const returnTo = isSafeRedirect(rawReturn) ? rawReturn : "/";

  const result = await refreshAccessToken();

  if (result.status === "ok") {
    return NextResponse.redirect(new URL(returnTo, url.origin));
  }

  if (result.status === "service_error") {
    // Transient auth-service problem — send the user back so the page
    // can render its own "service unavailable" UI instead of bouncing
    // them to the homepage.
    return NextResponse.redirect(new URL(returnTo, url.origin));
  }

  // expired | cannot_refresh → no valid session. Send home.
  return NextResponse.redirect(new URL("/", url.origin));
}

function isSafeRedirect(path: string): boolean {
  // Only allow in-app redirects — no protocol-relative, no absolute URLs,
  // no attempts to escape via "//evil.com".
  return path.startsWith("/") && !path.startsWith("//");
}
