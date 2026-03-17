import type { Metadata } from "next";
import CategoryPageClient from "./CategoryPageClient";

type CategoryMetadata = {
  title: string;
  description: string;
};

const categoryMeta: Record<string, CategoryMetadata> = {
  kids: {
    title: "Custom Kids Coloring Book from Photos",
    description:
      "Create a personalized kids coloring book using your own family photos. Bold line art style, printed or digital. A one-of-a-kind gift kids will love.",
  },
  pets: {
    title: "Custom Pet Portrait Sketchbook from Photos",
    description:
      "Turn your pet's photo into a beautiful, detailed sketch book. A unique gift for pet lovers — printed or as a PDF download.",
  },
  anime: {
    title: "Custom Anime Coloring Book from Your Photos",
    description:
      "Convert your photos into stunning anime-style illustrations and build your own custom coloring book. Perfect gift for anime fans.",
  },
  dementia: {
    title: "Personalized Memory Care Coloring Book from Photos",
    description:
      "Create a custom, dementia-friendly coloring book using real family photos. Designed for memory care patients — familiar, soothing, and deeply personal.",
  },
  seniors: {
    title: "Personalized Memory Care Coloring Book for Seniors",
    description:
      "Create a custom coloring book for seniors using real family photos. Designed for reminiscence therapy and meaningful engagement.",
  },
};

const defaultMeta: CategoryMetadata = {
  title: "Custom Coloring Book Collection",
  description:
    "Explore our unique coloring book collection. Upload your photos and convert them into personalized, printable coloring pages.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug).toLowerCase();
  const meta = categoryMeta[decoded] || defaultMeta;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: `${meta.title} | sktchLABS`,
      description: meta.description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  return <CategoryPageClient slug={slug} />;
}
