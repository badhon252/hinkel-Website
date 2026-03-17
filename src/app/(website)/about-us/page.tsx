import Aboutus from "@/components/website/PageSections/AboutusPage/Aboutus";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About sktchLABS | Personalized Coloring Books from Photos",
  description:
    "Learn how sktchLABS turns your personal photos into custom coloring and sketch books — with privacy-first technology and unique artistic styles.",
};

const page = () => {
  return <Aboutus />;
};

export default page;
