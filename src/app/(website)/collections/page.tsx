import StylesPage from "@/features/category-page/pages/StylesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coloring Books | Kids, Pets, Anime, Dementia, Seniors",
  description:
    "Explore our unique coloring book styles. Upload your photos and convert them into line art, pet sketches, anime, kids coloring books, dementia and senior memory care coloring pages.",
};

export default function page() {
  return <StylesPage />;
}
