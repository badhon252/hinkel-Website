"use client";

import { use, Fragment } from "react";
import { Hero } from "@/features/category-page/components/hero";
import { GallerySection } from "@/features/category-page/components/gallery-section";
import { useContent } from "@/features/category-page/hooks/use-content";
import { useGetCmsByType } from "@/features/dashboard/hooks/useCms";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import type { CategoryContent } from "@/features/category-page/api/category.api";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = use(params);
  const slug = decodeURIComponent(rawSlug);

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
    <div className="min-h-screen">
      <Hero type={slug} heroContent={heroContent} />

      {cmsContent?.richText && (
        <section className="py-12 md:py-20 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RichTextRenderer content={cmsContent.richText} />
          </div>
        </section>
      )}

      {contents.map((item: CategoryContent, index: number) => (
        <Fragment key={item._id || index}>
          {item.gallery && item.gallery.length > 0 && (
            <GallerySection
              images={item.gallery as string[]}
              title={item.title}
            />
          )}
        </Fragment>
      ))}

      {contents.length === 0 && !cmsContent && (
        <div className="py-20 text-center">
          <p className="text-gray-500">No content found for this category.</p>
        </div>
      )}
    </div>
  );
}
