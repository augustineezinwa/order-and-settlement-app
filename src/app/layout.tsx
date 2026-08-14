import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { QueryProvider } from "@/api/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orders & Settlements — Order tracking and payment ledger",
  description:
    "Create orders, record payments, and track settlement progress with derived totals and ledger integrity.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          impeccable-direction-contract
          THESIS: Step sequencer — settlement as a timed sequence of recorded events, not a static dashboard.
          OWN-WORLD: Clean Ledger monochrome, Geist sans/mono, flat zinc surfaces, pill CTAs, sixteen-step row with chase light.
          STORY: Operator sees order progress as discrete steps with payments landing in sequence; believes ledger is enforced; signs up.
          FIRST VIEWPORT: Nav + headline left, sixteen-step lifecycle row with lit keys and amount-due readout.
          FORM: Drum machine step row composition (concept-seed reroll 1, index 3).
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
        */}
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
