import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Orders & Settlements — Order tracking and payment ledger",
  description:
    "Create orders, record payments, and track settlement progress with derived totals and ledger integrity.",
};

export default function Home() {
  return (
    <>
      {/*
        impeccable-direction-contract
        THESIS: Settlement as a mechanical calculation you can watch happen — every order and
          payment strikes the tape like a lever-punch; totals ring up, nothing is edited.
        OWN-WORLD: Warm ivory ground, near-black ink, one alarm-red accent. A perforated receipt
          tape prints transactions line by line; a digit-wheel readout rolls like an adding
          machine. Oswald (stamped condensed caps) for labels, Geist Sans for body, Geist Mono
          for the tape and ledger figures.
        STORY: Visitor watches a real tape print an order's payments; understands totals are
          struck mechanically, never hand-edited; trusts it; presses "Press to begin."
        FIRST VIEWPORT: Headline + rolling balance readout left, printing receipt tape right,
          alarm-red key-punch CTA beneath the readout.
        FORM: Mechanical adding machine / cash-register receipt tape — user-chosen from two
          built directions (assigned index 5 of 7 grounded candidates, seed key 3f949344).
          Sections 2 and 3 adopt the Certificate direction's wording by request: "the four
          states of settlement" (order lifecycle as punched ticket stubs) and "the ledger
          holds because the mechanism enforces it" (mechanism heading), both re-dressed in
          this world's own material rather than the certificate's engraving.
        FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
          review, the verdict, and DESIGN.md.
      */}
      <LandingPage />
    </>
  );
}
