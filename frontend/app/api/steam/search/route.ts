export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("q") ?? "";

  const res = await fetch(
    `https://store.steampowered.com/api/storesearch?term=${encodeURIComponent(term)}&cc=US&l=english`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    return Response.json({ total: 0, items: [] }, { status: res.status });
  }

  const data = await res.json();
  return Response.json(data);
}
