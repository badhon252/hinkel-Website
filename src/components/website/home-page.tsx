import { Hero } from "../../features/category-page/components/hero";
import { CategoryGrid } from "@/features/category-page/components/category-grid";
import { FAQ } from "./Common/faq";
import BookCreationFlow from "./PageSections/HomePage/BookCreationFlow";

export default function HomePage() {
  return (
    <>
      <Hero type="home" />
      <CategoryGrid />
      <BookCreationFlow />
      <FAQ />
    </>
  );
}
