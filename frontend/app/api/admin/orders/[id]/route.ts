import { adminProxy } from "@/lib/admin-proxy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return adminProxy({ method: "GET", path: `/api/admin/orders/${id}` });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  return adminProxy({ method: "PUT", path: `/api/admin/orders/${id}`, body });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return adminProxy({ method: "DELETE", path: `/api/admin/orders/${id}` });
}
