import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

async function getUserId(token: string): Promise<number | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const user = await res.json();
    return typeof user.id === "number" ? user.id : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userid = await getUserId(token);
  if (userid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${BACKEND_URL}/balance?userid=${userid}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ error: "Backend error" }, { status: 502 });
    const data = await res.json();
    return NextResponse.json({ balance: data.balance });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
