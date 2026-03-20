export type Platform = "steam" | "epic" | "xbox" | "playstation" | "switch";

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
  platform: Platform;
  genres: string[];
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  badges: BadgeType[];
  releaseDate?: string;
  releasedAgo?: string;
  timeLeft?: string;
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
