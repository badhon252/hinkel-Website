import HomePage from "@/components/website/home-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Coloring Books from Your Photos",
  description:
    "Turn your photos into personalized coloring books and sketchbooks. Choose from Kids, Pets, Anime & Dementia-friendly collections. Print or digital. Create free account.",
};

export default function page() {
  return <HomePage />;
}
