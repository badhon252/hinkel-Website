import TermsConditions from "@/components/website/PageSections/TermsConditions/TermsConditions";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the sktchLABS terms of service for using our personalized coloring book creation platform.",
};

export default function page() {
  return (
    <div>
      <TermsConditions />
    </div>
  );
}
