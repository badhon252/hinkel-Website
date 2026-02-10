"use client";

import React, { useState, useEffect } from "react";
import { Hero } from "@/features/category-page/components/hero";
import { GallerySection } from "@/features/category-page/components/gallery-section";
import { useContent } from "@/features/category-page/hooks/use-content";
import { useGetCmsByType } from "@/features/dashboard/hooks/useCms";
import RichTextRenderer from "@/components/shared/RichTextRenderer";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    params.then((p) => setSlug(decodeURIComponent(p.slug)));
  }, [params]);

  const { data } = useContent({ type: slug });
  const { data: cmsData } = useGetCmsByType(slug);

  const category = data?.data?.[0];
  const galleryImages = category?.gallery || [];
  const cmsContent = cmsData?.data?.data?.contents?.[0];

  return (
    <div className="min-h-screen">
      <Hero type={slug.toLocaleLowerCase()} />

      {cmsContent?.richText && (
        <section className="py-12 md:py-20 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RichTextRenderer content={cmsContent.richText} />
          </div>
        </section>
      )}

      {galleryImages.length > 0 && (
        <GallerySection images={galleryImages} title={category?.title} />
      )}
    </div>
  );
}
