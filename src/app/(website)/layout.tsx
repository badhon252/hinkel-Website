import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/website/Common/Navbar";
import Footer from "@/components/website/Common/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://sktchlabs.com"),
  title: {
    default: "Custom Coloring Books from Your Photos | sktchLABS",
    template: "%s | sktchLABS",
  },
  description:
    "Turn your photos into personalized coloring books and sketchbooks. Choose from Kids, Pets, Anime & Dementia-friendly collections. Print or digital. Create free account.",
  icons: {
    icon: "/images/logo.svg",
  },
  openGraph: {
    type: "website",
    siteName: "sktchLABS",
    locale: "en_US",
    url: "https://sktchlabs.com",
    title: "Custom Coloring Books from Your Photos | sktchLABS",
    description:
      "Turn your photos into personalized coloring books and sketchbooks. Choose from Kids, Pets, Anime & Dementia-friendly collections.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Coloring Books from Your Photos | sktchLABS",
    description:
      "Turn your photos into personalized coloring books and sketchbooks. Choose from Kids, Pets, Anime & Dementia-friendly collections.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "sktchLABS",
  url: "https://sktchlabs.com",
  logo: "https://sktchlabs.com/images/logo.svg",
  description:
    "sktchLABS turns your personal photos into custom coloring and sketch books with privacy-first technology and unique artistic styles.",
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
