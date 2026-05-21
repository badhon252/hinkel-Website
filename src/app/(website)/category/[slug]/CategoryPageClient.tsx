import { Hero } from "@/features/category-page/components/hero";
import type { CategoryContent } from "@/features/category-page/types";
import type { CmsContent } from "@/features/dashboard/api/cms.api";
import PlainTextContent from "@/components/shared/PlainTextContent";

export default function CategoryPageClient({
  slug,
  contents,
  cmsContent,
}: Readonly<{
  slug: string;
  contents: CategoryContent[];
  cmsContent?: CmsContent;
}>) {
  const heroContent = contents[0];

  return (
    <div className="min-h-[90vh]">
      <Hero type={slug} heroContent={heroContent} />

      {(cmsContent?.plainText || cmsContent?.richText) && (
        <section className="py-12 md:py-20 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PlainTextContent
              content={cmsContent.plainText || cmsContent.richText}
              className="max-w-4xl text-base leading-8 text-gray-700"
            />
          </div>
        </section>
      )}

      {contents.length === 0 && !cmsContent && (
        <div className="py-20 text-center">
          <p className="text-gray-500">No content found for this category.</p>
        </div>
      )}
    </div>
  );
}
