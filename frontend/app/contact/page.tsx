import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getAuthState } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Contact Us — Condensation",
  description:
    "Get in touch with the Condensation support team. We're here to help with orders, keys, billing, and everything else.",
};

const CONTACT_TOPICS = [
  "Order & Delivery Issue",
  "Invalid / Missing Key",
  "Billing & Refund",
  "Account & Security",
  "Partnership / Business",
  "Other",
];

const CONTACT_CHANNELS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
        <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
      </svg>
    ),
    label: "Email Support",
    value: "support@condensation.gg",
    sub: "Response within 24 hours",
    accent: "primary",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    label: "Live Chat",
    value: "Available 9 AM – 6 PM CET",
    sub: "Typical wait under 5 min",
    accent: "tertiary",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    ),
    label: "Help Center",
    value: "Browse our FAQ",
    sub: "Instant answers, 24/7",
    accent: "secondary",
  },
];

export default async function ContactPage() {
  const { isLoggedIn, userName } = await getAuthState();

  return (
    <>
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <main className="min-h-[calc(100vh-4rem)]">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-20 pb-14">
          {/* Background ambient glow blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, #22daff 0%, transparent 70%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-0 h-[360px] w-[360px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle, #d575ff 0%, transparent 70%)" }}
          />

          <div className="relative mx-auto max-w-7xl px-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
              Support
            </p>
            <h1 className="font-headline text-5xl font-bold tracking-tight text-on-surface md:text-6xl">
              How can we{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #22daff, #00b8e0)" }}
              >
                help you?
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-on-surface-variant">
              Reach the Condensation team through the form below, or pick whichever
              channel suits you best. We&apos;re here to sort things out — fast.
            </p>
          </div>
        </section>

        {/* ── Main grid ── */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">

            {/* ── Contact Form ── */}
            <div className="rounded-2xl bg-surface-container-high p-8 md:p-10">
              <h2 className="mb-6 font-headline text-2xl font-semibold text-on-surface">
                Send a message
              </h2>

              <form
                id="contact-form"
                className="space-y-5"
                /* onSubmit left unimplemented as per specification */
              >
                {/* Row: Name + Email */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Full name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      className="w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all focus:ring-1 focus:ring-primary/40 focus:shadow-[0_0_12px_rgba(34,218,255,0.08)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Email address
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all focus:ring-1 focus:ring-primary/40 focus:shadow-[0_0_12px_rgba(34,218,255,0.08)]"
                    />
                  </div>
                </div>

                {/* Order ID (optional) */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-order" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Order ID
                    <span className="rounded bg-surface-container-highest px-1.5 py-0.5 text-[10px] font-normal normal-case tracking-normal text-on-surface-variant/60">
                      optional
                    </span>
                  </label>
                  <input
                    id="contact-order"
                    name="orderId"
                    type="text"
                    placeholder="ORD-XXXXXXXX"
                    className="w-full rounded-xl bg-surface-container-highest px-4 py-3 font-mono text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all focus:ring-1 focus:ring-primary/40 focus:shadow-[0_0_12px_rgba(34,218,255,0.08)]"
                  />
                </div>

                {/* Topic */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Topic
                  </p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Contact topic">
                    {CONTACT_TOPICS.map((topic) => (
                      <label key={topic} className="group cursor-pointer">
                        <input
                          type="radio"
                          name="topic"
                          value={topic}
                          className="sr-only"
                        />
                        <span className="inline-flex items-center rounded-lg bg-surface-container-highest px-3 py-1.5 text-sm text-on-surface-variant ring-1 ring-transparent transition-all group-has-[:checked]:bg-primary/10 group-has-[:checked]:text-primary group-has-[:checked]:ring-primary/30 hover:text-on-surface">
                          {topic}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-subject" className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    placeholder="Brief summary of your issue"
                    className="w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all focus:ring-1 focus:ring-primary/40 focus:shadow-[0_0_12px_rgba(34,218,255,0.08)]"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    placeholder="Tell us everything. The more detail, the faster we can help."
                    className="w-full resize-none rounded-xl bg-surface-container-highest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all focus:ring-1 focus:ring-primary/40 focus:shadow-[0_0_12px_rgba(34,218,255,0.08)]"
                  />
                </div>

                {/* Attachment hint */}
                <p className="flex items-center gap-1.5 text-xs text-on-surface-variant/60">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  You can paste screenshots or attach files to a follow-up email.
                </p>

                {/* CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="cta-gradient inline-flex h-12 items-center gap-2 rounded-xl px-7 text-sm font-bold text-on-primary-fixed transition-opacity hover:opacity-90 focus-visible:ring-1 focus-visible:ring-primary/40"
                  >
                    Send message
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            {/* ── Sidebar ── */}
            <aside className="flex flex-col gap-6">

              {/* Contact channels */}
              <div className="rounded-2xl bg-surface-container-high p-6">
                <h2 className="mb-5 font-headline text-lg font-semibold text-on-surface">
                  Other ways to reach us
                </h2>
                <ul className="space-y-4">
                  {CONTACT_CHANNELS.map((ch) => (
                    <li key={ch.label} className="flex items-start gap-4">
                      <span
                        className={`mt-0.5 shrink-0 rounded-xl p-2.5 ${
                          ch.accent === "primary"
                            ? "bg-primary/10 text-primary"
                            : ch.accent === "tertiary"
                            ? "bg-tertiary/10 text-tertiary"
                            : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        {ch.icon}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{ch.label}</p>
                        <p className="mt-0.5 text-sm text-on-surface-variant">{ch.value}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant/60">{ch.sub}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Response time SLA */}
              <div className="rounded-2xl bg-surface-container p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="live-pulse" aria-hidden />
                  <p className="text-xs font-semibold uppercase tracking-wider text-tertiary">
                    Current status
                  </p>
                </div>
                <p className="text-sm font-semibold text-on-surface">All systems operational</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Average ticket resolution time today:{" "}
                  <span className="font-semibold text-on-surface">3 h 12 min</span>
                </p>
              </div>

              {/* Quick links */}
              <div className="rounded-2xl bg-surface-container p-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Quick answers
                </h3>
                <ul className="space-y-0">
                  {[
                    "How do I redeem my key?",
                    "Can I get a refund?",
                    "My key is already used",
                    "How long does delivery take?",
                    "How to link my Steam account?",
                  ].map((q) => (
                    <li key={q}>
                      <a
                        href="#"
                        className="flex items-center justify-between py-2.5 text-sm text-on-surface-variant transition-colors hover:text-on-surface"
                      >
                        <span>{q}</span>
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="shrink-0 opacity-40"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </a>
                      {/* separator via bg shift, no border */}
                      <div className="h-px bg-surface-container-highest opacity-60" />
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
