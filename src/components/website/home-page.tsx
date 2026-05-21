import type {
  CategoryContent,
  CategoryHeader,
} from "@/features/category-page/types";
import type { PublicFaqData } from "@/features/website-content/api/website-content.api";
import { Hero } from "../../features/category-page/components/hero";
import { CategoryGrid } from "@/features/category-page/components/category-grid";
import { FAQ } from "./Common/faq";
import BookCreationFlow from "./PageSections/HomePage/BookCreationFlow";

interface HomePageProps {
  heroContent?: CategoryContent;
  categories: CategoryContent[];
  categoryHeader?: CategoryHeader;
  faqData?: PublicFaqData | null;
}

export default function HomePage({
  heroContent,
  categories,
  categoryHeader,
  faqData,
}: HomePageProps) {
  return (
    <>
      <Hero type="home" heroContent={heroContent} />
      <CategoryGrid categories={categories} headerContent={categoryHeader} />
      <BookCreationFlow />
      <FAQ faqData={faqData} />
    </>
  );
}
