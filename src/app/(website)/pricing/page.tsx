import Pricing from "@/components/website/PageSections/PricingPage/Pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - sktch LABS",
  description:
    "View our simple and transparent pricing plans for creating your AI-powered coloring books.",
};

const page = () => {
  return <Pricing />;
};

export default page;
