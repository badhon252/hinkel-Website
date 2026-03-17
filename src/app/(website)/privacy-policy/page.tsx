import PrivacyPolicy from "@/components/website/PageSections/PrivacyPolicy/PrivacyPolicy";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the sktchLABS privacy policy. We permanently delete all photos after your book is complete. Your privacy and data security are our top priority.",
};

export default function page() {
  return (
    <div>
      <PrivacyPolicy />
    </div>
  );
}
