import Pricing from "@/components/website/PageSections/PricingPage/Pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Custom Coloring Book Plans",
  description:
    "View our simple and transparent pricing plans for creating personalized coloring books from your photos. Kids, Pets, Anime & Memory Care collections.",
};

const page = () => {
  return <Pricing />;
};

export default page;
