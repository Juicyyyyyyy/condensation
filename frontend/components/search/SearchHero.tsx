"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

export function SearchHero({
  query,
  total,
}: {
  query: string;
  total: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = inputRef.current?.value.trim();
    if (!term) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pt-10 pb-6">
      <p className="mb-3 font-headline text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        Search Intelligence
      </p>

      {query ? (
        <div className="flex items-end justify-between gap-8">
          <h1 className="font-headline text-5xl font-bold uppercase tracking-tight text-on-surface md:text-6xl">
            Results for{" "}
            <span className="text-primary">&lsquo;{query}&rsquo;</span>
          </h1>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-headline text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              {total} Record{total !== 1 ? "s" : ""} Retrieved
            </span>
          </div>
        </div>
      ) : (
        <h1 className="font-headline text-5xl font-bold uppercase tracking-tight text-on-surface md:text-6xl">
          Search Games
        </h1>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
        <input
          ref={inputRef}
          type="search"
          defaultValue={query}
          placeholder="Search by title, genre, or keyword…"
          className="flex-1 rounded-xl border-none bg-surface-container-highest px-5 py-3.5 text-sm text-on-surface placeholder:text-outline/50 outline-none transition-all focus:ring-1 focus:ring-primary/40"
        />
        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-3.5 font-headline text-sm font-bold uppercase tracking-wider text-on-primary transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Search
        </button>
      </form>
    </section>
  );
}
