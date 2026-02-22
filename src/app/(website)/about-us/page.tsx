import Aboutus from "@/components/website/PageSections/AboutusPage/Aboutus";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - SktchLABS",
  description: "Learn more about SktchLABS and our services.",
};

const page = () => {
  return <Aboutus />;
};

export default page;
