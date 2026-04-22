import type {
  Game,
  BackendPage,
  BestsellerGame,
  DealTier,
  RelatedGame,
} from "./types";

import { fetchFeaturedData } from "./steam-api";

/* ── Catalog (server-side, calls backend directly) ── */

export async function getCatalogGames(
  size = 100
): Promise<{ games: Game[]; genreLabel: null }> {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
  const url = new URL(`${backendUrl}/api/games`);
  url.searchParams.set("size", String(size));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return { games: [], genreLabel: null };

  const data: BackendPage = await res.json();
  return { games: data.content, genreLabel: null };
}

export async function getCatalogGamesByGenre(
  genreId: number,
  size = 100
): Promise<{ games: Game[]; genreLabel: string | null }> {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
  const url = new URL(`${backendUrl}/api/games`);
  url.searchParams.set("genreId", String(genreId));
  url.searchParams.set("size", String(size));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return { games: [], genreLabel: null };

  const data: BackendPage = await res.json();

  const genreLabel =
    data.content
      .flatMap((g) => g.genres)
      .find((g) => g.id === genreId)?.description ?? null;

  return { games: data.content, genreLabel };
}

/* ── Recommended games ── */

export async function getRecommendedGames(): Promise<Game[]> {
  const data = await fetchFeaturedData();
  return data.specials;
}

/* ── Bestsellers ── */

export async function getBestsellerGames(): Promise<BestsellerGame[]> {
  const data = await fetchFeaturedData();
  return data.topSellers
    .slice(0, 20)
    .filter((game) => game.priceFinal < 15000)
    .slice(0, 10)
    .map((game, i) => ({ ...game, rank: i + 1 }));
}

/* ── New Releases ── */

export async function getNewReleases(): Promise<Game[]> {
  const data = await fetchFeaturedData();
  return data.newReleases.slice(0, 6);
}

/* ── Pre-orders ── */

export async function getPreOrders(): Promise<Game[]> {
  const data = await fetchFeaturedData();
  return data.comingSoon.slice(0, 6);
}

/* ── Budget Deals ── */

function buildDealTier(label: string, minCents: number, maxCents: number, items: Game[]): DealTier {
  return {
    label,
    maxPrice: maxCents / 100,
    games: items
      .filter((g) => g.priceFinal > minCents && g.priceFinal <= maxCents && g.reductionPercentage > 0)
      .slice(0, 6),
  };
}

export async function getDealTiers(): Promise<DealTier[]> {
  const data = await fetchFeaturedData();
  const allDiscounted = [
    ...data.specials,
    ...data.newReleases,
    ...data.topSellers,
  ].filter((g) => g.reductionPercentage > 0 && g.priceFinal > 0);

  return [
    buildDealTier("Under €5",    0,    500,  allDiscounted),
    buildDealTier("Under €10",   500,  1000, allDiscounted),
    buildDealTier("Under €20",   1000, 2000, allDiscounted),
    buildDealTier("Under €50",   2000, 5000, allDiscounted),
  ];
}

/* ── Related games ── */

export async function getRelatedGames(
  genreId: number,
  excludeId?: number,
  size = 8
): Promise<RelatedGame[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const url = new URL(`${baseUrl}/api/steam/games`);
  url.searchParams.set("genreId", String(genreId));
  url.searchParams.set("size", String(size));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];

  const data: BackendPage = await res.json();

  return data.content
    .filter((game) => game.id !== excludeId)
    .slice(0, 4)
    .map((game) => ({
      ...game,
      genreBadge: game.genres[0]?.description?.toUpperCase() ?? "GAME",
    }));
}

export const allGenres: string[] = [
  "Action",
  "RPG",
  "Strategy",
  "Indie",
  "Simulation",
  "Racing",
  "Sports",
  "Adventure",
  "Shooter",
  "Puzzle",
  "Horror",
  "Platformer",
  "Survival",
  "Sandbox",
  "Fighting",
];

export const popularSearches: string[] = [
  "ELDEN RING",
  "Cyberpunk 2077",
  "Baldur's Gate 3",
  "Red Dead Redemption 2",
  "Crimson Desert",
  "Slay the Spire 2",
];
