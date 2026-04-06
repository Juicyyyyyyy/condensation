export type Platform = "windows" | "mac" | "linux";

export type BadgeType =
  | "discount"
  | "new"
  | "pre-order"
  | "rare"
  | "popular"
  | "instant";

export interface Game {
  id: string;
  title: string;
  slug: string;
  platforms: Platform[];
  genres: string[];
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  badges: BadgeType[];
  releaseDate?: string;
  releasedAgo?: string;
  timeLeft?: string;
  image?: string;
  headerImage?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  price: number;
  gradientFrom: string;
  gradientTo: string;
  image?: string;
}

export interface BestsellerGame extends Game {
  rank: number;
}

export interface DealTier {
  label: string;
  maxPrice: number;
  games: Game[];
}

export type SortOption =
  | "bestselling"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "discount";

export type ViewMode = "grid" | "list";

export interface CatalogFilters {
  platforms: Platform[];
  genres: string[];
  priceMin: number;
  priceMax: number;
}

/* ── Product Detail Page ── */

export interface SteamCategory {
  id: number;
  description: string;
}

export interface SteamGenre {
  id: string;
  description: string;
}

export interface SteamScreenshot {
  id: number;
  path_thumbnail: string;
  path_full: string;
}

export interface SteamPlatforms {
  windows: boolean;
  mac: boolean;
  linux: boolean;
}

export interface SteamPriceOverview {
  currency: string;
  initial: number;
  final: number;
  discount_percent: number;
  initial_formatted?: string;
  final_formatted?: string;
}

export interface SteamRequirements {
  minimum?: string;
  recommended?: string;
}

export interface SteamMovie {
  id: number;
  name: string;
  thumbnail: string;
  dash_av1?: string;
  dash_h264?: string;
  hls_h264?: string;
  highlight: boolean;
}

export interface GameDetail extends Omit<Game, "genres" | "platforms"> {
  detailed_description: string;
  about_the_game: string;
  supported_languages: string;
  developers: string[];
  publishers: string[];
  categories: SteamCategory[];
  genres: SteamGenre[];
  platforms: SteamPlatforms;
  price_overview: SteamPriceOverview;
  screenshots: SteamScreenshot[];
  movies?: SteamMovie[];
  pc_requirements: SteamRequirements;
  mac_requirements?: SteamRequirements;
  linux_requirements?: SteamRequirements;
  recommendations_total?: number;
  metacritic_score?: number;
  required_age?: string | number;
}

export interface DeluxePerk {
  icon: string;
  title: string;
  description: string;
}

export interface DLCItem {
  id: string;
  title: string;
  price: number;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
}

export type RelatedGame = Game & { genreBadge: string };

/* ── Backend /api/games/{id} response ── */

export interface BackendCompany {
  company: { id: number; name: string };
  role: string;
}

export interface BackendScreenshot {
  id: number;
  steamId: number;
  pathThumbnail: string;
  pathFull: string;
  position: number;
}

export interface BackendMovie {
  id: number;
  steamId: number;
  name: string;
  thumbnail: string;
  dashAv1?: string;
  dashH264?: string;
  hlsH264?: string;
  highlight: boolean;
  position: number;
}

export interface BackendGameDetail {
  id: number;
  steamAppId: number;
  name: string;
  slug: string;
  headerImage: string;
  priceFinal: number;
  reductionPercentage: number;
  recommendationsTotal: number;
  releaseDate: string;
  releaseDateRaw: string;
  genres: { id: number; description: string }[];
  detailedDescription: string;
  aboutTheGame: string;
  supportedLanguages: string;
  requiredAge: number;
  metacriticScore: number;
  currency: string;
  priceInitial: number;
  pcRequirements: SteamRequirements;
  macRequirements: SteamRequirements;
  linuxRequirements: SteamRequirements;
  companies: BackendCompany[];
  categories: SteamCategory[];
  screenshots: BackendScreenshot[];
  movies: BackendMovie[];
  updatedAt: string;
}

