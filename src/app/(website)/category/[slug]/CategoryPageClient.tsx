"use client";

import { Hero } from "@/features/category-page/components/hero";
import { useContent } from "@/features/category-page/hooks/use-content";
import { useGetCmsByType } from "@/features/dashboard/hooks/useCms";
import RichTextRenderer from "@/components/shared/RichTextRenderer";

export default function CategoryPageClient({
  slug,
}: Readonly<{ slug: string }>) {
  const { data, isLoading, error } = useContent({ type: slug });
  const { data: cmsData } = useGetCmsByType(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Hero type={slug} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          Failed to load content. Please try again later.
        </p>
      </div>
    );
  }

  const contents = data?.data || [];
  const heroContent = contents[0];
  const cmsContent = cmsData?.data?.data?.contents?.[0];

  return (
    <div className="min-h-[90vh]">
      <Hero type={slug} heroContent={heroContent} />

      {cmsContent?.richText && (
        <section className="py-12 md:py-20 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RichTextRenderer content={cmsContent.richText} />
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
