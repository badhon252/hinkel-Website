import RefundPolicy from "@/components/website/PageSections/RefundPolicy/RefundPolicy";
import React from "react";
import { Metadata } from "next";
import { getPublicReturnPolicy } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Refund & Return Policy",
  description:
    "Read our refund and return policy for sktchLABS personalized coloring books and sketch books.",
  alternates: {
    canonical: "/refund",
  },
  openGraph: {
    url: "/refund",
    title: "Refund & Return Policy | sktchLABS",
    description:
      "Read our refund and return policy for sktchLABS personalized coloring books and sketch books.",
  },
};

export default async function page() {
  const policyData = await getPublicReturnPolicy();

  return (
    <div>
      <RefundPolicy policy={policyData.data?.[0]} />
    </div>
  );
}
