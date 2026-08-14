import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
        404
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Nothing recorded at this entry
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
        The order or page you&apos;re looking for doesn&apos;t exist, or the link is out of date.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-full bg-[var(--foreground)] px-5 text-sm font-medium text-[var(--background)] hover:bg-[var(--foreground-hover)]"
      >
        Back to orders
      </Link>
    </div>
  );
}
