import { cookies } from "next/headers";

const AUTH_URL =
  process.env.API_URL ?? process.env.AUTH_URL ?? "http://localhost:8000";

export type RefreshResult =
  | { status: "ok"; token: string }
  | { status: "expired" }
  | { status: "service_error" }
  | { status: "cannot_refresh" };

let inflight: Promise<RefreshResult> | null = null;

export async function refreshAccessToken(): Promise<RefreshResult> {
  if (inflight) return inflight;
  inflight = doRefresh().finally(() => {
    inflight = null;
  });
  return inflight;
}

async function doRefresh(): Promise<RefreshResult> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) return { status: "expired" };

  // Passport rotates (and invalidates) the refresh_token on every call
  // to /oauth/token. We must only talk to Laravel from a context where
  // we can persist the rotated token back to the browser — i.e. a Route
  // Handler, Server Action, or Middleware. In Server Components cookies
  // are read-only; attempting refresh there would burn the current
  // refresh_token and strand the user until re-login. Probe first.
  try {
    cookieStore.set("__rt_probe", "", { maxAge: 0, path: "/" });
  } catch {
    return { status: "cannot_refresh" };
  }

  let res: Response;
  try {
    res = await fetch(`${AUTH_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.CLIENT_ID,
      }),
      cache: "no-store",
    });
  } catch {
    return { status: "service_error" };
  }

  if (res.status >= 500) return { status: "service_error" };
  if (!res.ok) return { status: "expired" };

  const tokens = await res.json().catch(() => null);
  if (!tokens?.access_token) return { status: "expired" };

  cookieStore.set("access_token", tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: tokens.expires_in,
    sameSite: "lax",
  });
  if (tokens.refresh_token) {
    cookieStore.set("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  return { status: "ok", token: tokens.access_token };
}
