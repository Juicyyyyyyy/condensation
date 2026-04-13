"use client";

import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { setBalance } from "@/lib/balance-store";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const PRESETS = [5, 10, 25, 50, 100];

type ModalState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "ready"; clientSecret: string; amountCents: number }
  | { type: "confirming"; clientSecret: string; amountCents: number }
  | { type: "success" }
  | { type: "error"; message: string };

interface TopUpModalProps {
  open: boolean;
  onClose: () => void;
}

export function TopUpModal({ open, onClose }: TopUpModalProps) {
  const [state, setState] = useState<ModalState>({ type: "idle" });
  const [amount, setAmount] = useState("10");

  // Reset to idle when modal opens
  useEffect(() => {
    if (open) {
      setState({ type: "idle" });
      setAmount("10");
    }
  }, [open]);

  const handleClose = useCallback(async () => {
    if (state.type === "success") {
      // Re-fetch balance after successful payment
      try {
        const res = await fetch("/api/balance");
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
        }
      } catch {
        // Ignore — balance will sync on next load
      }
    }
    onClose();
  }, [state.type, onClose]);

  async function handleCreateIntent() {
    const dollars = parseFloat(amount);
    if (!Number.isFinite(dollars) || dollars < 1) {
      setState({ type: "error", message: "Minimum top-up is $1.00" });
      return;
    }
    const cents = Math.round(dollars * 100);
    setState({ type: "loading" });
    try {
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cents }),
      });
      if (!res.ok) throw new Error("Failed to create payment intent");
      const data = await res.json();
      setState({ type: "ready", clientSecret: data.clientSecret, amountCents: cents });
    } catch {
      setState({ type: "error", message: "Could not start payment. Please try again." });
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-high p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-headline text-lg font-semibold text-on-surface">
            Top Up Balance
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Idle / amount selection */}
        {(state.type === "idle" || state.type === "error") && (
          <div>
            <p className="mb-3 text-sm text-on-surface-variant">Select amount</p>
            <div className="mb-3 flex gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(String(preset))}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    amount === String(preset)
                      ? "bg-primary/20 text-primary"
                      : "bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Custom amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mb-4 w-full rounded-lg bg-surface-container-highest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all focus:ring-1 focus:ring-primary/40"
            />
            {state.type === "error" && (
              <p className="mb-3 text-xs text-error">{state.message}</p>
            )}
            <button
              onClick={handleCreateIntent}
              className="w-full rounded-lg bg-gradient-to-br from-primary to-primary-container py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {/* Loading */}
        {state.type === "loading" && (
          <div className="flex items-center justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {/* Stripe Elements */}
        {(state.type === "ready" || state.type === "confirming") && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: state.clientSecret, appearance: { theme: "night" } }}
          >
            <PaymentForm
              amountCents={state.amountCents}
              confirming={state.type === "confirming"}
              onConfirming={() =>
                setState((s) =>
                  s.type === "ready"
                    ? { type: "confirming", clientSecret: s.clientSecret, amountCents: s.amountCents }
                    : s
                )
              }
              onSuccess={() => setState({ type: "success" })}
              onError={(msg) => setState({ type: "error", message: msg })}
            />
          </Elements>
        )}

        {/* Success */}
        {state.type === "success" && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tertiary/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="font-headline text-lg font-semibold text-on-surface">Payment successful!</p>
            <p className="mt-1 text-sm text-on-surface-variant">Your balance will update shortly.</p>
            <button
              onClick={handleClose}
              className="mt-6 w-full rounded-lg bg-gradient-to-br from-primary to-primary-container py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentForm({
  amountCents,
  confirming,
  onConfirming,
  onSuccess,
  onError,
}: {
  amountCents: number;
  confirming: boolean;
  onConfirming: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    onConfirming();
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    if (result.error) {
      onError(result.error.message ?? "Payment failed. Please try again.");
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-3 text-sm text-on-surface-variant">
        Paying <span className="font-semibold text-on-surface">${(amountCents / 100).toFixed(2)}</span>
      </p>
      <PaymentElement />
      <button
        type="submit"
        disabled={confirming || !stripe || !elements}
        className="mt-4 w-full rounded-lg bg-gradient-to-br from-primary to-primary-container py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {confirming ? "Processing…" : "Pay Now"}
      </button>
    </form>
  );
}
