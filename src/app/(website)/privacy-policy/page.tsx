import PrivacyPolicy from "@/components/website/PageSections/PrivacyPolicy/PrivacyPolicy";
import React from "react";
import { Metadata } from "next";
import { getPublicPrivacy } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the sktchLABS privacy policy. We permanently delete all photos after your book is complete. Your privacy and data security are our top priority.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    url: "/privacy-policy",
    title: "Privacy Policy | sktchLABS",
    description:
      "Read the sktchLABS privacy policy. We permanently delete all photos after your book is complete. Your privacy and data security are our top priority.",
  },
};

export default async function page() {
  const privacyData = await getPublicPrivacy();

  return (
    <div>
      <PrivacyPolicy
        title={privacyData.data?.title}
        content={privacyData.data?.content}
      />
    </div>
  );
}
