import { cookies } from "next/headers";
import { refreshAccessToken } from "./refresh-token";

const AUTH_URL =
  process.env.API_URL ?? process.env.AUTH_URL ?? "http://localhost:8000";

export type AdminAuthResult =
  | { status: "ok"; token: string }
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "service_error" }
  | { status: "needs_refresh" };

/**
 * Resolves the caller's admin status. Distinguishes:
 *  - ok: valid admin token (possibly refreshed inside a Route Handler)
 *  - unauthenticated: no token and no refresh_token — user must re-login
 *  - forbidden: valid token but role !== "admin"
 *  - service_error: auth service is unreachable / 5xx — do NOT sign the user out
 *  - needs_refresh: caller is a Server Component and the token needs to be
 *    refreshed in a writable context. The caller should redirect the user
 *    to /api/auth/refresh-redirect, which will perform the refresh and
 *    bounce back to the original URL.
 */
export async function resolveAdminAuth(): Promise<AdminAuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const hasRefreshToken = Boolean(cookieStore.get("refresh_token")?.value);

  if (!token) {
    if (!hasRefreshToken) return { status: "unauthenticated" };
    const refreshed = await refreshAccessToken();
    if (refreshed.status === "ok") return checkRole(refreshed.token);
    if (refreshed.status === "service_error") return { status: "service_error" };
    if (refreshed.status === "cannot_refresh") return { status: "needs_refresh" };
    return { status: "unauthenticated" };
  }

  const first = await checkRole(token);
  if (first.status !== "unauthenticated") return first;

  // Token present but rejected by auth service — try to refresh once.
  const refreshed = await refreshAccessToken();
  if (refreshed.status === "ok") return checkRole(refreshed.token);
  if (refreshed.status === "service_error") return { status: "service_error" };
  if (refreshed.status === "cannot_refresh") return { status: "needs_refresh" };
  return { status: "unauthenticated" };
}

async function checkRole(token: string): Promise<AdminAuthResult> {
  let res: Response;
  try {
    res = await fetch(`${AUTH_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return { status: "service_error" };
  }

  if (res.status === 401) return { status: "unauthenticated" };
  if (res.status >= 500) return { status: "service_error" };
  if (!res.ok) return { status: "unauthenticated" };

  const user = await res.json().catch(() => null);
  if (!user) return { status: "service_error" };
  if (user.role !== "admin") return { status: "forbidden" };
  return { status: "ok", token };
}

/**
 * Back-compat helper. Returns a valid admin token or null. Cannot
 * distinguish needs_refresh from unauthenticated — callers that need
 * that distinction should use resolveAdminAuth() directly and redirect
 * to /api/auth/refresh-redirect when appropriate.
 */
export async function getAdminToken(): Promise<string | null> {
  const result = await resolveAdminAuth();
  return result.status === "ok" ? result.token : null;
}
