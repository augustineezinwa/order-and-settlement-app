import { Oswald } from "next/font/google";

/** Stamped condensed caps for the landing page's Receipt Tape world — nav, labels, buttons. */
export const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
});
