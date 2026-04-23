import { redirect } from "next/navigation";
import { resolveAdminAuth } from "@/lib/admin-auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { headers } from "next/headers";

export const metadata = {
  title: "Admin — Condensation",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await resolveAdminAuth();

  if (auth.status === "unauthenticated") redirect("/");
  if (auth.status === "forbidden") redirect("/");
  if (auth.status === "needs_refresh") {
    const returnTo = await currentPath();
    redirect(
      `/api/auth/refresh-redirect?return=${encodeURIComponent(returnTo)}`
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--on-surface)]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-8">
        {auth.status === "service_error" ? (
          <div className="max-w-md mx-auto mt-24 p-6 rounded-2xl bg-[var(--surface-container)] border border-[var(--outline-variant)] text-center">
            <h1 className="text-lg font-semibold mb-2">Auth service unavailable</h1>
            <p className="text-sm text-[var(--on-surface-variant)] mb-4">
              We couldn&apos;t verify your session right now. This is usually transient.
              Your session is still valid — please try again in a moment.
            </p>
            <a
              href="/admin"
              className="inline-block px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold"
            >
              Retry
            </a>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

async function currentPath(): Promise<string> {
  const h = await headers();
  const pathname = h.get("x-pathname");
  if (pathname && pathname.startsWith("/admin")) return pathname;
  const referer = h.get("referer");
  if (referer) {
    try {
      const u = new URL(referer);
      if (u.pathname.startsWith("/admin")) return u.pathname + u.search;
    } catch {
      // ignore malformed referer
    }
  }
  return "/admin";
}
