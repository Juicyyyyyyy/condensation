"use client";

import type { GameDetail } from "@/lib/types";

export function ProductHero({ game }: { game: GameDetail }) {
  const thumbnails = game.screenshots.slice(0, 8);
  const finalPrice = (game.price_overview.final ?? 0) / 100;
  const ageText = String(game.required_age || "E");
  const genreText =
    game.genres.length > 0
      ? game.genres.map((genre) => genre.description).join(" · ")
      : "N/A";
  const genreMetaText = game.genres.map((genre) => genre.description).join(", ");
  const categoryText = game.categories.map((category) => category.description).join(", ");

  return (
    <section className="mx-auto flex max-w-7xl gap-8 mb-6">
      {/* Left — Media */}
      <div className="flex flex-col gap-3 w-2/3">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#0a2a3a] via-[#0f3040] to-[#162530]">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={thumbnails[0]?.path_full || game.image}
              alt={game.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute bottom-4 left-4 right-4 h-1 rounded-full bg-gradient-to-r from-primary/60 to-transparent" />
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {thumbnails.map((shot, i) => (
            <button
              key={shot.id}
              className={`aspect-video h-14 shrink-0 overflow-hidden rounded-md transition-all ${
                i === 0
                  ? "ring-2 ring-primary"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={shot.path_thumbnail}
                alt={`${game.title} screenshot ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Right — Purchase Panel */}
      <div className="flex w-1/3 flex-col gap-4">
        {/* Title + age rating */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl font-bold uppercase leading-none tracking-tight text-on-surface">
              {game.title}
            </h1>
            <p className="mt-2 text-xs uppercase tracking-wider text-on-surface-variant">
              {genreText}
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-surface-container-highest px-2 py-1 text-center text-[10px] font-bold uppercase leading-tight text-on-surface-variant">
            {ageText}
          </span>
        </div>

        {/* Pricing from API */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
            Price
          </p>
          <div className="flex items-center justify-between rounded-lg bg-surface-container-high px-4 py-3">
            <span className="text-sm font-bold text-on-surface">Standard Edition</span>
            <span className="text-lg font-bold text-on-surface">
              ${finalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <button className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-container py-3.5 text-sm font-bold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90">
          Buy Now
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/20 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Add to Cart
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/20 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            Wishlist
          </button>
        </div>

        {/* Scores */}
        <div className="flex items-center justify-between gap-0 pt-2">
          {/* Metacritic */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-fit items-center justify-center rounded-lg bg-surface-container-highest px-3">
              <span className="text-xl font-bold text-primary">
                {game.metacritic_score ?? 0}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
              Metacritic
            </span>
          </div>

          {/* Recommended */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-fit items-center justify-center rounded-lg bg-surface-container-highest px-3">
              <span className="text-xl font-bold text-tertiary">
                {Math.min(99, Math.round((game.recommendations_total ?? 0) / 250))}%
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
              Recommended
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Developer</span>
            <span className="font-medium text-on-surface">{game.developers.join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Publisher</span>
            <span className="font-medium text-on-surface">{game.publishers.join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Release Date</span>
            <span className="font-medium text-on-surface">{game.releaseDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Genre</span>
            <span className="font-medium text-on-surface">{genreMetaText || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Categories</span>
            <span className="w-[272px] font-medium text-on-surface">{categoryText || "N/A"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
