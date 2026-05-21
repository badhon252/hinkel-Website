import Pricing from "@/components/website/PageSections/PricingPage/Pricing";
import { Metadata } from "next";
import { getPublicPricing } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Pricing | Custom Coloring Book Plans",
  description:
    "View our simple and transparent pricing plans for creating personalized coloring books from your photos. Kids, Pets, Anime & Memory Care collections.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    url: "/pricing",
    title: "Pricing | Custom Coloring Book Plans | sktchLABS",
    description:
      "View our simple and transparent pricing plans for creating personalized coloring books from your photos. Kids, Pets, Anime & Memory Care collections.",
  },
};

const page = async () => {
  const pricingData = await getPublicPricing();

  return <Pricing prices={pricingData.data || []} />;
};

export default page;
