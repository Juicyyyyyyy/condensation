import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshAccessToken } from "./refresh-token";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

type ProxyOptions = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
};

/**
 * Proxies an admin request to the Spring backend. Spring is the single
 * enforcement point for admin role. Transparently retries once with a
 * refreshed access token on 401. All other backend statuses are returned
 * to the caller verbatim so the UI can distinguish 401 / 403 / 5xx.
 */
export async function adminProxy({ method, path, body }: ProxyOptions) {
  const cookieStore = await cookies();
  let token = cookieStore.get("access_token")?.value;

  if (!token) {
    const refreshed = await refreshAccessToken();
    if (refreshed.status === "service_error") {
      return NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
    }
    if (refreshed.status !== "ok") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    token = refreshed.token;
  }

  const first = await forward(token, method, path, body);
  if (first.kind === "response" && first.response.status !== 401) {
    return first.response;
  }
  if (first.kind === "network_error") {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }

  // status === 401 — token likely expired mid-session; try refresh + retry once.
  const refreshed = await refreshAccessToken();
  if (refreshed.status === "service_error") {
    return NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
  }
  if (refreshed.status !== "ok") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const retry = await forward(refreshed.token, method, path, body);
  if (retry.kind === "network_error") {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
  return retry.response;
}

type ForwardResult =
  | { kind: "response"; response: NextResponse }
  | { kind: "network_error" };

async function forward(
  token: string,
  method: string,
  path: string,
  body: unknown,
): Promise<ForwardResult> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  let payload: string | undefined;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers,
      body: payload,
      cache: "no-store",
    });
  } catch {
    return { kind: "network_error" };
  }

  if (res.status === 204) {
    return { kind: "response", response: new NextResponse(null, { status: 204 }) };
  }

  const text = await res.text();
  if (!text) {
    return { kind: "response", response: new NextResponse(null, { status: res.status }) };
  }
  try {
    const data = JSON.parse(text);
    return {
      kind: "response",
      response: NextResponse.json(data, { status: res.status }),
    };
  } catch {
    return {
      kind: "response",
      response: new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": "text/plain" },
      }),
    };
  }
}
