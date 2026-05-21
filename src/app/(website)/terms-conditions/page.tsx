import TermsConditions from "@/components/website/PageSections/TermsConditions/TermsConditions";
import React from "react";
import { Metadata } from "next";
import { getPublicTerms } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the sktchLABS terms of service for using our personalized coloring book creation platform.",
  alternates: {
    canonical: "/terms-conditions",
  },
  openGraph: {
    url: "/terms-conditions",
    title: "Terms of Service | sktchLABS",
    description:
      "Read the sktchLABS terms of service for using our personalized coloring book creation platform.",
  },
};

export default async function page() {
  const termsData = await getPublicTerms();

  return (
    <div>
      <TermsConditions terms={termsData.data?.[0]} />
    </div>
  );
}
