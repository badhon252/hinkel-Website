import RefundPolicy from "@/components/website/PageSections/RefundPolicy/RefundPolicy";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Return Policy",
  description:
    "Read our refund and return policy for sktchLABS personalized coloring books and sketch books.",
};

export default function page() {
  return (
    <div>
      <RefundPolicy />
    </div>
  );
}
