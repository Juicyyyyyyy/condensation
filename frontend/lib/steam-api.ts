import type { Game, Platform, SearchResultGame } from "./types";

/* ── Raw Steam featured API types ── */

export interface RawItem {
  id: number;
  name: string;
  discounted: boolean;
  discount_percent: number;
  original_price: number | null;
  final_price: number;
  currency: string;
  large_capsule_image: string;
  small_capsule_image: string;
  header_image: string;
  windows_available: boolean;
  mac_available: boolean;
  linux_available: boolean;
  controller_support?: string;
  discount_expiration?: number;
}

export interface RawFeaturedData {
  specials: { items: RawItem[] };
  top_sellers: { items: RawItem[] };
  new_releases: { items: RawItem[] };
  coming_soon: { items: RawItem[] };
}

/* ── Raw Steam storesearch API types ── */

export interface SteamSearchItem {
  type: string;
  name: string;
  id: number;
  price?: {
    currency: string;
    initial: number;
    final: number;
  };
  tiny_image: string;
  metascore?: string;
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
}

export interface SteamSearchResult {
  total: number;
  items: SteamSearchItem[];
}

/* ── Helpers ── */

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function centsToPrice(cents: number | null): number {
  if (cents == null || cents === 0) return 0;
  return cents / 100;
}

function detectPlatform(_item: RawItem): Platform {
  return "steam";
}

export function rawToGame(item: RawItem, index: number): Game {
  const price = centsToPrice(item.final_price);
  const originalPrice = item.discounted
    ? centsToPrice(item.original_price)
    : undefined;
  const discountPercent = item.discounted ? item.discount_percent : undefined;

  const badges: Game["badges"] = [];
  if (item.discounted && item.discount_percent > 0) badges.push("discount");

  return {
    id: `${item.id}-${index}`,
    title: item.name,
    slug: slugify(item.name),
    platform: detectPlatform(item),
    genres: [],
    price,
    originalPrice,
    discountPercent,
    badges,
    image: item.large_capsule_image,
    headerImage: item.header_image,
  };
}

function searchItemPlatforms(item: SteamSearchItem): string[] {
  const out: string[] = [];
  if (item.platforms.windows) out.push("PC");
  if (item.platforms.mac) out.push("Mac");
  if (item.platforms.linux) out.push("Linux");
  return out;
}

function searchItemToGame(item: SteamSearchItem): SearchResultGame {
  const finalCents = item.price?.final ?? 0;
  const initialCents = item.price?.initial ?? 0;
  const price = centsToPrice(finalCents);
  const originalPrice =
    initialCents !== finalCents ? centsToPrice(initialCents) : undefined;
  const discountPercent =
    originalPrice != null && initialCents > 0
      ? Math.round(((initialCents - finalCents) / initialCents) * 100)
      : undefined;

  return {
    id: String(item.id),
    title: item.name,
    slug: slugify(item.name),
    platforms: searchItemPlatforms(item),
    price,
    originalPrice,
    discountPercent,
  };
}

/* ── In-memory cache for featured data ── */

let cachedFeaturedData: RawFeaturedData | null = null;

export async function fetchFeaturedData(): Promise<RawFeaturedData> {
  if (cachedFeaturedData) return cachedFeaturedData;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/steam/featured`, {
    next: { revalidate: 3600 },
  });
  cachedFeaturedData = await res.json();
  return cachedFeaturedData as RawFeaturedData;
}

/* ── Steam store search ── */

export async function searchSteamGames(
  term: string
): Promise<{ total: number; games: SearchResultGame[] }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/steam/search?q=${encodeURIComponent(term)}`,
    { cache: "no-store" }
  );

  if (!res.ok) return { total: 0, games: [] };

  const data: SteamSearchResult = await res.json();
  return {
    total: data.total ?? 0,
    games: (data.items ?? [])
      .filter((item) => item.type === "app")
      .map(searchItemToGame),
  };
}
