import { cookies } from "next/headers";
import { refreshAccessToken } from "./refresh-token";

const AUTH_URL =
  process.env.API_URL ?? process.env.AUTH_URL ?? "http://localhost:8000";

type AuthState = {
  isLoggedIn: boolean;
  userName: string | null;
  isAdmin: boolean;
};

const LOGGED_OUT: AuthState = { isLoggedIn: false, userName: null, isAdmin: false };

/**
 * Returns the authenticated user's state. Called from Server Components
 * (layouts, pages, Header) on every render. NEVER calls Laravel's
 * /oauth/token from a read-only context — that would consume the
 * rotated refresh_token without being able to persist it, stranding the
 * user. Instead it only refreshes when the current process is running
 * in a writable context (e.g. the /api/auth/refresh-redirect route).
 */
export async function getAuthState(): Promise<AuthState> {
  const cookieStore = await cookies();
  let token = cookieStore.get("access_token")?.value;

  if (!token) {
    const refreshed = await refreshAccessToken();
    if (refreshed.status !== "ok") return LOGGED_OUT;
    token = refreshed.token;
  }

  const first = await fetchUser(token);
  if (first.kind === "ok") return first.state;
  if (first.kind === "service_error") return LOGGED_OUT;

  const refreshed = await refreshAccessToken();
  if (refreshed.status !== "ok") return LOGGED_OUT;
  const retry = await fetchUser(refreshed.token);
  return retry.kind === "ok" ? retry.state : LOGGED_OUT;
}

type FetchUserResult =
  | { kind: "ok"; state: AuthState }
  | { kind: "unauthenticated" }
  | { kind: "service_error" };

async function fetchUser(token: string): Promise<FetchUserResult> {
  let res: Response;
  try {
    res = await fetch(`${AUTH_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return { kind: "service_error" };
  }

  if (res.status === 401) return { kind: "unauthenticated" };
  if (res.status >= 500) return { kind: "service_error" };

  const contentType = res.headers.get("content-type");
  if (!res.ok || !contentType?.includes("application/json")) {
    return { kind: "unauthenticated" };
  }

  const user = await res.json().catch(() => null);
  if (!user) return { kind: "service_error" };
  return {
    kind: "ok",
    state: {
      isLoggedIn: true,
      userName: user.name ?? null,
      isAdmin: user.role === "admin",
    },
  };
}
