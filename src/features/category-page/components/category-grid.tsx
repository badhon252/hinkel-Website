"use client";

import { useEffect, useState, useCallback, useRef, memo, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Palette,
  Sparkles,
  MoveRight,
  MoveLeft,
} from "lucide-react";
import { useContent } from "@/features/category-page/hooks/use-content";
import { useCategoryHeader } from "@/features/category-page/hooks/use-categoryheader";
import CategoryGridSkeleton from "./category-grid.skeleton";
import type { CategoryContent } from "@/features/category-page/types";
import HeaderTitle from "@/components/website/Common/head-title";
import SubtitleCategory from "@/components/website/Common/SubtitleCategory";
import { cn } from "@/lib/utils";

// Types
interface CategoryCardProps {
  category: CategoryContent;
  index: number;
}

interface ScrollButtonProps {
  direction: "left" | "right";
  onClick: () => void;
}

// Constants
const CONTENT_LIMIT = 10;
const AUTO_SCROLL_INTERVAL = 4000;
const SCROLL_CHECK_DELAY = 100;
const SCROLL_AMOUNT_RATIO = 0.75;
const SCROLL_THRESHOLD = 10;

const DEFAULT_HEADER = {
  title: "Explore Art Styles",
  subtitle:
    "Transform your creativity with our diverse collection of artistic styles and themes",
};

const CARD_STYLES = {
  base: "group relative rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-2xl transition-all duration-700 ease-out shrink-0 snap-start border border-gray-200/50 hover:border-primary/30 hover:-translate-y-3",
  sizes: "w-[85%] sm:w-[48%] md:w-[32%] lg:w-[23%] xl:w-[calc(20%-1.6rem)]",
};

// Utility Functions
const filterCategories = (categories: CategoryContent[]): CategoryContent[] => {
  return categories.filter((c) => c.type?.toLowerCase() !== "home");
};

const checkIfScrollNeeded = (container: HTMLDivElement | null): boolean => {
  if (!container) return false;
  return container.scrollWidth > container.clientWidth;
};

// Subcomponents
const CategoryCard = memo(({ category, index }: CategoryCardProps) => (
  <Link
    href={`/category/${category.type}`}
    className={cn(CARD_STYLES.base, CARD_STYLES.sizes)}
    prefetch={true}
    style={{
      animationDelay: `${index * 60}ms`,
    }}
  >
    {/* Image Container with Overlay */}
    <div className="relative aspect-3/4 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <Image
        src={category.image || "/no-image.jpg"}
        alt={category.title || `${category.type} category`}
        fill
        sizes="(max-width: 640px) 85vw, (max-width: 768px) 48vw, (max-width: 1024px) 32vw, (max-width: 1280px) 23vw, 20vw"
        className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
        loading="lazy"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      {/* Interactive Overlay on Hover */}
      <div className="absolute inset-0 bg-linear-to-t from-primary/90 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
        {/* Category Badge */}
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 w-fit transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <Palette className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            Style
          </span>
        </div>

        {/* Category Title */}
        <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-75">
          {category.type}
        </h3>

        {/* Description / CTA */}
        <div className="flex items-center gap-2 text-white/90 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
          <span className="text-sm font-medium">Explore Collection</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>

      {/* Corner Decoration */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
      </div>
    </div>

    {/* Bottom Accent Bar */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
  </Link>
));

CategoryCard.displayName = "CategoryCard";

const ScrollButton = memo(({ direction, onClick }: ScrollButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "absolute top-1/2 -translate-y-1/2 z-40 bg-white/95 backdrop-blur-sm shadow-2xl rounded-full p-4 text-gray-700 hover:text-white hover:bg-primary hover:scale-110 transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
      direction === "left"
        ? "-left-4 md:-left-20 lg:-left-10"
        : "-right-4 md:-right-20 lg:-right-10",
    )}
    aria-label={`Scroll ${direction}`}
  >
    {direction === "left" ? (
      <MoveLeft className="w-4 h-4 md:w-6 md:h-6" />
    ) : (
      <MoveRight className="w-4 h-4 md:w-6 md:h-6" />
    )}
  </button>
));

ScrollButton.displayName = "ScrollButton";

const ErrorState = memo(() => (
  <section className="py-24 px-6 bg-secondary flex justify-center items-center">
    <div className="text-center space-y-3 max-w-md">
      <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-red-600 font-semibold text-lg">
        Failed to load categories
      </p>
      <p className="text-gray-500 text-sm">
        We&apos;re having trouble loading the content. Please try again later.
      </p>
    </div>
  </section>
));

ErrorState.displayName = "ErrorState";

// Main Component
export function CategoryGrid() {
  const {
    data: contentData,
    isLoading,
    error,
  } = useContent({
    limit: CONTENT_LIMIT,
  });
  const { data: headerData } = useCategoryHeader();
  const [isHovered, setIsHovered] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () => filterCategories(contentData?.data || []),
    [contentData?.data],
  );

  const headerContent = useMemo(
    () => ({
      title: headerData?.data?.data?.title || DEFAULT_HEADER.title,
      subtitle: headerData?.data?.data?.subtitle || DEFAULT_HEADER.subtitle,
    }),
    [headerData],
  );

  const scroll = useCallback((direction: "left" | "right") => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollAmount = container.clientWidth * SCROLL_AMOUNT_RATIO;
    const targetScroll =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Check if scrolling is needed
  useEffect(() => {
    const checkScroll = () => {
      setShowArrows(checkIfScrollNeeded(containerRef.current));
    };

    if (!isLoading) {
      const timeoutId = setTimeout(checkScroll, SCROLL_CHECK_DELAY);
      window.addEventListener("resize", checkScroll);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [isLoading, categories.length]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!showArrows || isHovered) return;

    const interval = setInterval(() => {
      if (!containerRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      const isAtEnd =
        scrollLeft + clientWidth >= scrollWidth - SCROLL_THRESHOLD;

      if (isAtEnd) {
        containerRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroll("right");
      }
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [showArrows, isHovered, scroll]);

  if (isLoading) {
    return <CategoryGridSkeleton />;
  }

  if (error) {
    return <ErrorState />;
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      className="py-20 px-6 bg-gradient-to-b from-gray-50 via-white to-gray-50/50 relative overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container mx-auto relative space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <HeaderTitle title={headerContent.title} />
          <SubtitleCategory subtitle={headerContent.subtitle} />
        </div>

        {/* Categories Container */}
        <div className="relative px-2">
          {/* Navigation Arrows */}
          {showArrows && (
            <>
              <ScrollButton direction="left" onClick={() => scroll("left")} />
              <ScrollButton direction="right" onClick={() => scroll("right")} />
            </>
          )}

          <div
            ref={containerRef}
            className="flex gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 py-8 scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {categories.map((category, index) => (
              <CategoryCard
                key={category._id}
                category={category}
                index={index}
              />
            ))}
          </div>

          {/* Gradient Fade on Edges */}
          {/* <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-10" /> */}
        </div>
      </div>
    </section>
  );
}
