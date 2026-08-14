import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-muted)]">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 md:px-6">
          <Link href="/" className="text-sm font-medium tracking-tight">
            Orders &amp; Settlements
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm rounded-lg border bg-card px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
