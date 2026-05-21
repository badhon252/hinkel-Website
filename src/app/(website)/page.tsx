import HomePage from "@/components/website/home-page";
import { Metadata } from "next";
import {
  getHeroContentByType,
  getPublicCategoryHeader,
  getPublicContent,
  getPublicFaq,
} from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Custom Coloring Books from Your Photos",
  description:
    "Turn your photos into personalized coloring books and sketchbooks. Choose from Kids, Pets, Anime & Dementia-friendly collections. Print or digital. Create free account.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    title: "Custom Coloring Books from Your Photos | sktchLABS",
    description:
      "Turn your photos into personalized coloring books and sketchbooks. Choose from Kids, Pets, Anime & Dementia-friendly collections. Print or digital. Create free account.",
  },
};

export default async function page() {
  const [contentData, categoryHeader, faqResponse] = await Promise.all([
    getPublicContent({ limit: 100 }),
    getPublicCategoryHeader(),
    getPublicFaq(),
  ]);

  return (
    <HomePage
      heroContent={getHeroContentByType(contentData.data, "home")}
      categories={contentData.data}
      categoryHeader={categoryHeader}
      faqData={faqResponse.data}
    />
  );
}
