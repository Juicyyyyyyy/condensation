export async function GET(
  _request: Request,
  { params }: { params: Promise<{ appid: string }> }
) {
  const { appid } = await params;
  const res = await fetch(`http://localhost:8080/api/games/${appid}`);
  if (!res.ok) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const data = await res.json();
  return Response.json(data);
}
