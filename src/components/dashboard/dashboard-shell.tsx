import Link from "next/link";

import { AccountMenu } from "@/components/auth/account-menu";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface-muted)]">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium tracking-tight">
              Orders &amp; Settlements
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex" aria-label="Dashboard">
              <Link href="/dashboard" className="text-foreground font-medium">
                Orders
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <AccountMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">{children}</main>
    </div>
  );
}
