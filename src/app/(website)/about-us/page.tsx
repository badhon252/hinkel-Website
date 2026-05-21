import Aboutus from "@/components/website/PageSections/AboutusPage/Aboutus";
import { Metadata } from "next";
import { getPublicAbout } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "About sktchLABS | Personalized Coloring Books from Photos",
  description:
    "Learn how sktchLABS turns your personal photos into custom coloring and sketch books — with privacy-first technology and unique artistic styles.",
  alternates: {
    canonical: "/about-us",
  },
  openGraph: {
    url: "/about-us",
    title: "About sktchLABS | Personalized Coloring Books from Photos",
    description:
      "Learn how sktchLABS turns your personal photos into custom coloring and sketch books — with privacy-first technology and unique artistic styles.",
  },
};

const page = async () => {
  const aboutData = await getPublicAbout();

  return (
    <Aboutus title={aboutData.data?.title} content={aboutData.data?.content} />
  );
};

export default page;
