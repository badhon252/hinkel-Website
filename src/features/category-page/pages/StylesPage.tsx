"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Stars } from "lucide-react";
import { useContent } from "@/features/category-page/hooks/use-content";
import { useStyles } from "@/features/dashboard/hooks/useStyle";
import { CategoryContent } from "@/features/category-page/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 100,
      duration: 0.8,
    },
  },
};

export default function StylesPage() {
  const { data: contentData, isLoading: isContentLoading } = useContent({
    limit: 100, // Fetch all images
  });
  const { data: styleData, isLoading: isStyleLoading } = useStyles();

  const categories = contentData?.data || [];
  const style = styleData?.data?.[0] || {
    title: "Unlock Your Creative Vision",
    subtitle:
      "Explore our curated collection of sketch styles. Each one is designed to transform your photos into a unique, printable coloring book experience.",
    badgeText: "Curated Collection",
  };

  if (isContentLoading || isStyleLoading) {
    return <StylesSkeleton />;
  }

  // Filter out 'home' type and valid categories
  const displayedCategories = categories.filter(
    (c: CategoryContent) => c.type?.toLowerCase() !== "home",
  );

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-primary/20">
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[80%] bg-primary/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] bg-blue-500/5 rounded-full blur-[140px]" />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-sm border border-gray-100 text-primary font-bold text-xs uppercase tracking-widest mb-10"
            >
              <Stars className="w-3.5 h-3.5 fill-current" />
              <span>{style.badgeText}</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-10 tracking-tight leading-[1.05]">
              {style.title.split(" ").slice(0, -2).join(" ")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ff8c42] relative inline-block">
                {style.title.split(" ").slice(-2).join(" ")}
                <svg
                  className="absolute -bottom-2 md:-bottom-4 left-0 w-full"
                  height="12"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 7C20 7 30 1 50 1C70 1 80 7 100 7"
                    stroke="url(#paint0_linear)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear"
                      x1="0"
                      y1="0"
                      x2="100"
                      y2="0"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#f46b31" />
                      <stop offset="1" stopColor="#ff8c42" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed max-w-3xl mx-auto font-medium mb-12">
              {style.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content List */}
      <section className="container mx-auto px-4 pb-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col gap-24 md:gap-40"
        >
          {displayedCategories.map(
            (category: CategoryContent, index: number) => (
              <StyleCard key={category._id} category={category} index={index} />
            ),
          )}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-24">
        <div className="bg-gray-900 rounded-[3rem] p-12 md:p-32 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            {/* Gradient Background */}
            <div className="absolute top-[-50%] left-[-20%] w-full h-full bg-primary rounded-full blur-[200px]" />
            <div className="absolute bottom-[-50%] right-[-20%] w-full h-full bg-blue-500 rounded-full blur-[200px]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
              Ready to create your masterpiece?
            </h2>
            <p className="text-gray-400 text-xl md:text-2xl font-medium max-w-2xl mx-auto">
              Join thousands of creators who&apos;ve turned their favorite
              moments into timeless coloring books.
            </p>
            <div className="pt-8">
              <Link href="/create-book">
                <Button className="bg-primary hover:bg-[#ff8c42] text-white h-20 px-16 rounded-3xl font-black text-xl md:text-2xl transition-all shadow-[0_20px_60px_rgba(244,107,49,0.4)] hover:shadow-[0_20px_80px_rgba(244,107,49,0.6)] hover:-translate-y-1 uppercase tracking-widest border-4 border-white/10">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StyleCard({
  category,
  index,
}: {
  category: CategoryContent;
  index: number;
}) {
  const [activeImage, setActiveImage] = React.useState(
    category.image || "/no-image.jpg",
  );

  // Combine main image and gallery images
  const allImages = React.useMemo(() => {
    const images = [category.image];
    if (category.gallery && category.gallery.length > 0) {
      images.push(...category.gallery);
    }
    return images.filter(Boolean) as string[];
  }, [category.image, category.gallery]);

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "group relative flex flex-col md:flex-row items-start gap-10 md:gap-20",
        index % 2 === 1 ? "md:flex-row-reverse" : "", // Alternating layout
      )}
    >
      {/* Image Section */}
      <div className="w-full md:w-1/2 relative perspective-1000 space-y-6">
        {/* Decorative Number */}
        <div
          className={cn(
            "absolute -top-12 md:-top-20 text-[8rem] md:text-[12rem] font-black text-gray-100 -z-10 select-none leading-none opacity-50 group-hover:text-primary/5 transition-colors duration-700 pointer-events-none",
            index % 2 === 0 ? "right-0 md:-left-20" : "left-0 md:-right-20",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="relative aspect-3/4 md:aspect-4/5 lg:aspect-16/11 w-full transform transition-transform duration-700 ease-out">
          {/* Shadow Blob */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-[20%] bg-black/20 blur-[60px] opacity-0 group-hover:opacity-60 transition-opacity duration-700" />

          <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/50 bg-white">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full"
            >
              <Image
                src={activeImage}
                alt={category.title}
                fill
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-black/10 pointer-events-none transition-colors duration-700" />
          </div>

          {/* Floating Badge */}
          <div
            className={cn(
              "absolute top-8 p-4 z-10",
              index % 2 === 0 ? "left-8" : "right-8",
            )}
          >
            <span className="px-5 py-2.5 rounded-full bg-white/95 backdrop-blur-md shadow-lg text-xs font-black uppercase tracking-widest text-primary">
              {category.type}
            </span>
          </div>
        </div>

        {/* Gallery Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={cn(
                  "relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300",
                  activeImage === img
                    ? "border-primary ring-2 ring-primary/20 scale-105 shadow-lg"
                    : "border-transparent opacity-60 hover:opacity-100 hover:scale-105",
                )}
              >
                <Image
                  src={img}
                  alt={`Gallery ${i}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text/Content Section */}
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-8 md:sticky md:top-32">
        <div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            {category.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-medium max-w-xl">
            {category.subtitle ||
              "Transform your photos into this distinctive artistic style. Perfect for creating memorable coloring pages with high-quality lines and details."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
          <Link
            href={`/create-book?type=${category.type}`}
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto bg-gray-900 hover:bg-primary text-white h-14 px-10 rounded-2xl font-black shadow-xl hover:shadow-primary/30 transition-all duration-300 text-base uppercase tracking-wider group-hover:scale-105">
              Create with {category.type}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link
            href={`/category/${category.type}`}
            className="w-full sm:w-auto"
          >
            <Button
              variant="outline"
              className="w-full sm:w-auto h-14 px-8 rounded-2xl font-bold border-2 border-gray-100 text-gray-600 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 text-base"
            >
              Details
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function StylesSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <section className="pt-32 pb-24 text-center">
        <div className="container mx-auto px-4">
          <Skeleton className="h-40 w-3/4 mx-auto rounded-3xl mb-8 opacity-50" />
          <Skeleton className="h-8 w-1/2 mx-auto rounded-xl opacity-30" />
        </div>
      </section>

      <section className="container mx-auto px-4 pb-32">
        <div className="space-y-40">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col md:flex-row gap-20 items-center",
                i % 2 === 0 ? "md:flex-row-reverse" : "",
              )}
            >
              <div className="w-full md:w-1/2">
                <Skeleton className="aspect-16/11 w-full rounded-[2.5rem]" />
              </div>
              <div className="w-full md:w-1/2 space-y-8">
                <Skeleton className="h-16 w-3/4 rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <div className="flex gap-4">
                  <Skeleton className="h-14 w-40 rounded-2xl" />
                  <Skeleton className="h-14 w-32 rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
