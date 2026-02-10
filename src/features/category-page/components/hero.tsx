"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { MoveRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useContent } from "@/features/category-page/hooks/use-content";
import HeroSkeleton from "@/features/category-page/components/hero.skeleton";
import { memo, useMemo } from "react";
import { CategoryContent } from "@/features/category-page/api/category.api";

// Types
interface HeroProps {
  type?: string;
}

interface CategoryStyle {
  bg: string;
  text: string;
  border: string;
}

// Constants
const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  home: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  sketch: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
  },
  "line art": {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
  },
  "oil painting": {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
  },
  watercolor: {
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    border: "border-cyan-200",
  },
  portrait: {
    bg: "bg-pink-50",
    text: "text-pink-600",
    border: "border-pink-200",
  },
  nature: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
};

const DEFAULT_STYLE: CategoryStyle = {
  bg: "bg-gray-50",
  text: "text-blue-600",
  border: "border-blue-200",
};

const DEFAULT_CONTENT = {
  title: "Turn Any Artwork Into Coloring Magic",
  subtitle:
    "Turn any photo or drawing into a clean coloring page with powerful AI technology, designed to capture every detail you love and transform it into creative outlines, ready for coloring, sharing, or printing instantly.",
  image: "/images/heroImage.png",
};

// Utils
const getCategoryStyle = (type?: string): CategoryStyle => {
  if (!type) return DEFAULT_STYLE;
  const normalizedType = type.toLowerCase();
  return CATEGORY_STYLES[normalizedType] || DEFAULT_STYLE;
};

const shouldShowBadge = (type?: string): boolean => {
  return type?.toLowerCase() !== "home";
};

// Subcomponents
const HeroContent = memo(
  ({
    type,
    heroContent,
    categoryStyle,
  }: {
    type?: string;
    heroContent: CategoryContent | undefined;
    categoryStyle: CategoryStyle;
  }) => (
    <div className="space-y-6">
      {shouldShowBadge(type) && (
        <Badge
          variant="outline"
          className={cn(
            "text-base px-4 py-1.5 font-semibold uppercase tracking-wider rounded-full border-2 transition-all duration-300",
            categoryStyle.bg,
            categoryStyle.text,
            categoryStyle.border,
          )}
        >
          {type || heroContent?.type || "Explore"}
        </Badge>
      )}

      <h1 className="text-5xl md:text-6xl font-black tracking-tight text-secondary-foreground leading-tight">
        {heroContent?.title || DEFAULT_CONTENT.title}
      </h1>

      <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed">
        {heroContent?.subtitle || DEFAULT_CONTENT.subtitle}
      </p>

      <Link
        href={
          type
            ? `/create-book?type=${encodeURIComponent(type)}`
            : "/create-book"
        }
        prefetch={true}
      >
        <Button
          size="lg"
          className="bg-primary text-white px-8 h-12 text-base font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
        >
          Start creating NOW!
          <MoveRightIcon className="ml-2" aria-hidden="true" />
        </Button>
      </Link>
    </div>
  ),
);

HeroContent.displayName = "HeroContent";

const HeroImage = memo(
  ({ heroContent }: { heroContent: CategoryContent | undefined }) => (
    <div className="relative max-h-full">
      <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white aspect-[12/11]">
        <Image
          src={
            typeof heroContent?.image === "string"
              ? heroContent.image
              : DEFAULT_CONTENT.image
          }
          alt={heroContent?.title || "Sketch transformation"}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      <div
        className="absolute -top-4 -right-4 w-24 h-24 bg-[radial-gradient(#FF7A3D_1px,transparent_1px)] [background-size:16px_16px] opacity-20 -z-10"
        aria-hidden="true"
      />
    </div>
  ),
);

HeroImage.displayName = "HeroImage";

const ErrorState = memo(() => (
  <div
    className="h-[600px] flex items-center justify-center text-red-500"
    role="alert"
  >
    Error loading content. Please try again later!
  </div>
));

ErrorState.displayName = "ErrorState";

// Main Component
export const Hero = memo(({ type }: HeroProps) => {
  const { data, isLoading: isContentLoading, error } = useContent({ type });

  const heroContent = useMemo(() => data?.data?.[0], [data]);
  const isLoading = isContentLoading;

  const categoryStyle = useMemo(
    () => getCategoryStyle(type || heroContent?.type),
    [type, heroContent?.type],
  );

  if (isLoading) {
    return <HeroSkeleton />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <section className="relative md:px-6 py-10 md:py-12 lg:px-12 bg-accent">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <HeroContent
          type={type}
          heroContent={heroContent}
          categoryStyle={categoryStyle}
        />
        <HeroImage heroContent={heroContent} />
      </div>
    </section>
  );
});

Hero.displayName = "Hero";
