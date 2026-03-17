import { ContactForm } from "@/features/contact/components/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the sktchLABS team. Questions about creating personalized coloring books from your photos? We're here to help.",
};

export default function page() {
  return (
    <div>
      <ContactForm />
      {/* <ContactInformation /> */}
    </div>
  );
}
