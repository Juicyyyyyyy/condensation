import { adminProxy } from "@/lib/admin-proxy";

export async function GET() {
  return adminProxy({ method: "GET", path: "/api/admin/orders" });
}

export async function POST(request: Request) {
  const body = await request.json();
  return adminProxy({ method: "POST", path: "/api/admin/orders", body });
}
