import StylesPage from "@/features/category-page/pages/StylesPage";
import { Metadata } from "next";
import { getPublicContent, getPublicStyles } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Coloring Books | Kids, Pets, Anime, Dementia, Seniors",
  description:
    "Explore our unique coloring book styles. Upload your photos and convert them into line art, pet sketches, anime, kids coloring books, dementia and senior memory care coloring pages.",
  alternates: {
    canonical: "/collections",
  },
  openGraph: {
    url: "/collections",
    title: "Coloring Books | Kids, Pets, Anime, Dementia, Seniors | sktchLABS",
    description:
      "Explore our unique coloring book styles. Upload your photos and convert them into line art, pet sketches, anime, kids coloring books, dementia and senior memory care coloring pages.",
  },
};

export default async function page() {
  const [contentData, stylesData] = await Promise.all([
    getPublicContent({ limit: 100 }),
    getPublicStyles(),
  ]);

  return (
    <StylesPage categories={contentData.data} style={stylesData.data?.[0]} />
  );
}
