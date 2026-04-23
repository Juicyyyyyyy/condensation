import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/refresh-token";

export async function POST() {
  const result = await refreshAccessToken();
  if (result.status === "ok") {
    return NextResponse.json({ ok: true });
  }
  if (result.status === "service_error") {
    return NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
  }
  return NextResponse.json({ error: "Session expired" }, { status: 401 });
}
