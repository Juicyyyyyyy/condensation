import type { BackendGameDetail, Game, Platform } from "./types";

/* ── Helpers ── */

export function centsToPrice(cents: number | null): number {
  if (cents == null || cents === 0) return 0;
  return cents / 100;
}

export function rawToGame(
  item: {
    id: number;
    name: string;
    discounted: boolean;
    discount_percent: number;
    original_price: number | null;
    final_price: number;
    large_capsule_image: string;
    header_image: string;
    windows_available: boolean;
    mac_available: boolean;
    linux_available: boolean;
  },
  index: number
): Game {
  const price = centsToPrice(item.final_price);
  const originalPrice = item.discounted
    ? centsToPrice(item.original_price)
    : undefined;
  const discountPercent = item.discounted ? item.discount_percent : undefined;

  const badges: Game["badges"] = [];
  if (item.discounted && item.discount_percent > 0) badges.push("discount");

  const platforms: Platform[] = [];
  if (item.windows_available) platforms.push("windows");
  if (item.mac_available) platforms.push("mac");
  if (item.linux_available) platforms.push("linux");

  return {
    id: `${item.id}-${index}`,
    title: item.name,
    slug: item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    platforms,
    genres: [],
    price,
    originalPrice,
    discountPercent,
    badges,
    image: item.large_capsule_image,
    headerImage: item.header_image,
  };
}

/* ── Steam app details ── */

export async function fetchSteamAppDetails(
  appid: number
): Promise<BackendGameDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/steam/${appid}`);
  if (!res.ok) return null;
  return res.json();
}

/* ── Steam store search ── */

export async function searchSteamGames(
  term: string
): Promise<{ total: number; games: Game[] }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/steam/search?q=${encodeURIComponent(term)}`,
    { cache: "no-store" }
  );

  if (!res.ok) return { total: 0, games: [] };

  const data: { total: number; items: Array<{ type: string; name: string; id: number; price?: { currency: string; initial: number; final: number }; tiny_image: string; metascore?: string; platforms: { windows: boolean; mac: boolean; linux: boolean } }> } = await res.json();
  return {
    total: data.total ?? 0,
    games: (data.items ?? [])
      .filter((item) => item.type === "app")
      .map((item) => {
        const finalCents = item.price?.final ?? 0;
        const initialCents = item.price?.initial ?? 0;
        const price = centsToPrice(finalCents);
        const originalPrice =
          initialCents !== finalCents ? centsToPrice(initialCents) : undefined;
        const discountPercent =
          originalPrice != null && initialCents > 0
            ? Math.round(((initialCents - finalCents) / initialCents) * 100)
            : undefined;

        const platforms: Platform[] = [];
        if (item.platforms.windows) platforms.push("windows");
        if (item.platforms.mac) platforms.push("mac");
        if (item.platforms.linux) platforms.push("linux");

        return {
          id: String(item.id),
          title: item.name,
          slug: item.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          platforms,
          genres: [],
          price,
          originalPrice,
          discountPercent,
          badges: (discountPercent ? ["discount"] : []) as Game["badges"],
        };
      }),
  };
}
