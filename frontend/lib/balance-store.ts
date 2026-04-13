"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "condensation.balance.v1";
const EVENT_NAME = "condensation:balance";

let cachedRaw: string | null | undefined = undefined;
let cachedBalance = 0;

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function ensureCache() {
  if (typeof window === "undefined") {
    cachedRaw = null;
    cachedBalance = 0;
    return;
  }
  const raw = readRaw();
  if (cachedRaw === raw) return;
  cachedRaw = raw;
  const parsed = Number(raw);
  cachedBalance = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function readBalance(): number {
  ensureCache();
  return cachedBalance;
}

function writeBalance(amount: number) {
  if (typeof window === "undefined") return;
  const clamped = Math.round(Math.max(0, amount) * 100) / 100;
  const raw = String(clamped);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedBalance = clamped;
  window.dispatchEvent(new Event(EVENT_NAME));
}

function subscribe(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    const before = cachedRaw;
    ensureCache();
    if (before !== cachedRaw) listener();
  };
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getBalance(): number {
  return readBalance();
}

/** Set balance from backend cents value (e.g. 1500 → $15.00 in store) */
export function setBalance(cents: number) {
  writeBalance(cents / 100);
}

export function useBalance(): number {
  return useSyncExternalStore(subscribe, getBalance, () => 0);
}
