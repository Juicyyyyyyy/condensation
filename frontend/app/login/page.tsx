"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGoogle,
  faSteam,
  faXbox,
  faPlaystation,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";

const OAUTH_PROVIDERS = [
  { icon: faGoogle, label: "Google", hoverColor: "group-hover:text-primary" },
  { icon: faSteam, label: "Steam", hoverColor: "group-hover:text-primary" },
  { icon: faXbox, label: "Xbox", hoverColor: "group-hover:text-tertiary" },
  {
    icon: faPlaystation,
    label: "PlayStation",
    hoverColor: "group-hover:text-secondary",
  },
  {
    icon: faDiscord,
    label: "Discord",
    hoverColor: "group-hover:text-secondary",
  },
];

export default function LoginPage() {
  return (
    <>
      <Header />

      <main className="relative flex min-h-screen flex-grow items-center justify-center overflow-hidden px-6 pt-24 pb-16">
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-[100px]" />

        {/* Auth Card */}
        <div className="z-10 w-full max-w-[480px]">
          <div className="glass-panel rounded-xl border border-outline-variant/10 p-10 shadow-2xl">
            <header className="mb-10 text-center">
              <h1 className="mb-2 font-headline text-5xl font-black italic uppercase tracking-tighter text-on-surface">
                Sign In
              </h1>
              <p className="font-medium tracking-tight text-on-surface-variant">
                Access your digital armory.
              </p>
            </header>

            <form
              className="space-y-6"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="ml-1 text-[10px] font-bold tracking-[0.2em] uppercase text-primary/80"
                >
                  Email
                </label>
                <div className="group relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="identity@neonvoid.market"
                    className="w-full rounded-xl border-none bg-surface-container-highest px-4 py-4 text-on-surface placeholder:text-outline/50 outline-none transition-all focus:ring-1 focus:ring-primary/40"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/80"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-[10px] font-bold tracking-widest uppercase text-secondary transition-colors hover:text-primary"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="group relative">
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your security key"
                    className="w-full rounded-xl border-none bg-surface-container-highest px-4 py-4 text-on-surface placeholder:text-outline/50 outline-none transition-all focus:ring-1 focus:ring-primary/40"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-container py-5 font-headline text-lg font-black uppercase tracking-tight text-on-primary-fixed shadow-[0_0_20px_rgba(161,250,255,0.3)] transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Sign In
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-10 flex items-center">
              <div className="flex-grow border-t border-outline-variant/20" />
              <span className="mx-4 flex-shrink-0 text-[10px] font-black uppercase tracking-[0.3em] text-outline">
                or continue with
              </span>
              <div className="flex-grow border-t border-outline-variant/20" />
            </div>

            {/* OAuth Grid */}
            <div className="grid grid-cols-5 gap-3">
              {OAUTH_PROVIDERS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  aria-label={`Sign in with ${p.label}`}
                  className="group aspect-square flex items-center justify-center rounded-xl bg-surface-container-highest transition-colors hover:bg-surface-bright"
                >
                  <FontAwesomeIcon
                    icon={p.icon}
                    className={`h-5 w-5 text-on-surface-variant transition-colors ${p.hoverColor}`}
                  />
                </button>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-on-surface-variant">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="ml-1 font-bold text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal footer strip */}
      <footer className="flex flex-col items-center gap-3 py-8">
        <div className="flex flex-wrap justify-center gap-6">
          {["Terms of Service", "Privacy Policy", "Cookie Settings", "Support"].map(
            (label) => (
              <a
                key={label}
                href="#"
                className="text-[10px] font-body tracking-widest uppercase text-primary opacity-70 transition-all hover:opacity-100 hover:text-secondary"
              >
                {label}
              </a>
            ),
          )}
        </div>
        <p className="text-[10px] font-body tracking-widest uppercase text-on-surface-variant/50">
          &copy; {new Date().getFullYear()} Condensation. All rights reserved.
        </p>
      </footer>

      {/* Background texture */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="h-full w-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDryjzjbVGhAOCuW15jmcZHhpz8JQZYpbkMjeUKgtbZosKZkoXS-Uu3yWaG4cx3uL6RLP2V71mqomDxjrDQKX8r-vQJpfbPJENw-746ekN9nQ980D_XYCQYKi-EbsouTj9WIv78B8QA4IegRjIpHMcYkWAXL-OpuESUWsHrN5lAIkgrbM1S_IywMZMNkSz-80g9kYPX2Wi1nWcA41fw3QvMB39B7RKOnDPcCM6Doa3nLumbgR05gKZ-54cifq2-sa2DkX-7d-HJTrAr"
        />
      </div>
    </>
  );
}
