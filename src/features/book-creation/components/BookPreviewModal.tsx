"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBookStore } from "../store/book-store";
import type { BookState, PreviewPage } from "../types";
import { buildBookPreviewPages } from "../utils/preview-pages";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileImage,
  Heart,
  Layers,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface BookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const clampZoom = (value: number) => Math.min(1.3, Math.max(0.75, value));

const pageVariants = {
  enter: (dir: "left" | "right") => ({
    x: dir === "right" ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: "left" | "right") => ({
    x: dir === "right" ? -80 : 80,
    opacity: 0,
  }),
};

const pageTypeIcon: Record<string, React.ReactNode> = {
  cover: <BookOpen className="h-3.5 w-3.5 text-orange-400" />,
  dedication: <Heart className="h-3.5 w-3.5 text-pink-400" />,
  content: <Layers className="h-3.5 w-3.5 text-stone-400" />,
};

function PreviewCanvas({ page }: { page: PreviewPage }) {
  const title = page.title || "My Coloring Book";

  return (
    <div className="mx-auto aspect-[8.5/11] w-full max-w-[640px] rounded-[28px] border border-stone-300 bg-white p-6 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.8)]">
      <div className="flex h-full flex-col rounded-[20px] p-4">
        {page.type === "cover" ? (
          <div className="flex h-full flex-col items-center rounded-[14px] border border-stone-900 px-6 py-8 text-center">
            <h3 className="text-2xl font-black uppercase tracking-[0.12em] text-stone-900 sm:text-3xl">
              {title}
            </h3>
            <div className="mt-8 flex flex-1 w-full items-center justify-center overflow-hidden rounded-[18px] bg-stone-50 p-4">
              {page.imageSrc ? (
                <div className="relative h-full w-full">
                  <Image
                    src={page.imageSrc}
                    alt={title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-stone-300">
                  <FileImage className="h-12 w-12" />
                  <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                    No cover selected
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {page.type === "dedication" ? (
          <div className="flex h-full flex-1 items-center justify-center px-8 text-center">
            <p className="max-w-[28rem] whitespace-pre-wrap text-xl font-medium italic leading-9 text-stone-800">
              {page.dedicationText}
            </p>
          </div>
        ) : null}

        {page.type === "content" ? (
          <div className="flex h-full flex-col">
            <div className="min-h-[56px] px-4 pt-2 text-center">
              <p className="line-clamp-2 text-xl font-black text-stone-900">
                {page.topLine || " "}
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center px-3 py-4">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[16px] border border-stone-200 bg-stone-50">
                {page.imageSrc ? (
                  <Image
                    src={page.imageSrc}
                    alt={page.label}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-stone-300">
                    <FileImage className="h-12 w-12" />
                    <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                      Empty page
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="min-h-[64px] px-4 pb-2 text-center">
              <p className="line-clamp-2 text-xl font-black text-stone-900">
                {page.bottomLine || " "}
              </p>
            </div>
            <p className="pt-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
              Page {page.contentPageNumber}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function BookPreviewModal({
  isOpen,
  onClose,
}: BookPreviewModalProps) {
  const state = useBookStore((bookState: BookState) => bookState);
  const pages = useMemo(() => buildBookPreviewPages(state), [state]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(0.8);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const activePageRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number>(0);
  const lastScrollTime = useRef<number>(0);

  const safeIndex = Math.min(currentIndex, Math.max(pages.length - 1, 0));
  const currentPage = pages[safeIndex];

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentIndex(0);
      setZoom(1);
      onClose();
    }
  };

  const goPrevious = useCallback(() => {
    setDirection("left");
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goNext = useCallback(() => {
    setDirection("right");
    setCurrentIndex((prev) => Math.min(pages.length - 1, prev + 1));
  }, [pages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrevious();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "=" || e.key === "+")
        setZoom((prev) => clampZoom(prev + 0.1));
      else if (e.key === "-") setZoom((prev) => clampZoom(prev - 0.1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goPrevious, goNext]);

  // Scroll active sidebar item into view
  useEffect(() => {
    activePageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [safeIndex]);

  const handleWheel = (e: React.WheelEvent) => {
    // When zoomed in past 100%, let the container scroll normally
    if (zoom > 1) return;
    const now = Date.now();
    if (now - lastScrollTime.current < 400) return;
    lastScrollTime.current = now;
    if (e.deltaY > 0) goNext();
    else goPrevious();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) goNext();
      else goPrevious();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="h-[94vh] w-[98vw] max-w-[98vw] sm:max-w-[98vw] lg:w-[min(1360px,98vw)] overflow-hidden rounded-[28px] border border-stone-800 bg-stone-950 p-0 text-white"
        showCloseButton={false}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500/15 p-2 text-orange-300">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  Book Preview
                </DialogTitle>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom((prev) => clampZoom(prev - 0.1))}
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                <ZoomOut className="mr-2 h-4 w-4" />
                Zoom out
              </Button>
              <span className="min-w-14 text-center text-sm font-semibold text-stone-300">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(1)}
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                <Search className="mr-2 h-4 w-4" />
                Fit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom((prev) => clampZoom(prev + 0.1))}
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                <ZoomIn className="mr-2 h-4 w-4" />
                Zoom in
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                Close
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <div className="border-b border-white/10 bg-stone-900/80 p-4 lg:w-[260px] lg:border-r lg:border-b-0">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-[0.22em] text-stone-400">
                  Pages
                </h4>
                <span className="text-xs font-semibold text-stone-500">
                  {pages.length} total
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
                {pages.map((page, index) => (
                  <button
                    key={page.id}
                    ref={index === safeIndex ? activePageRef : undefined}
                    onClick={() => {
                      setDirection(index > safeIndex ? "right" : "left");
                      setCurrentIndex(index);
                    }}
                    className={`min-w-[140px] rounded-2xl border px-4 py-3 text-left transition-all lg:min-w-0 ${
                      index === safeIndex
                        ? "border-orange-400 bg-orange-500/15 text-white"
                        : "border-white/10 bg-white/5 text-stone-300 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-stone-400">
                      Sheet {page.pageNumber}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {pageTypeIcon[page.type]}
                      <p className="text-sm font-bold">{page.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.16),_transparent_38%),linear-gradient(180deg,#111827_0%,#020617_100%)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-400">
                    Currently previewing
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {currentPage?.label || "No pages available"}
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-stone-300">
                  {safeIndex + 1} / {pages.length || 1}
                </div>
              </div>

              <div
                className="min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-6"
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {currentPage ? (
                  <div
                    className="mx-auto flex min-h-full items-start justify-center overflow-hidden"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "top center",
                    }}
                  >
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div
                        key={safeIndex}
                        custom={direction}
                        variants={pageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="w-full"
                      >
                        <PreviewCanvas page={currentPage} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-400">
                    No preview pages are ready yet.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
                <Button
                  variant="outline"
                  onClick={goPrevious}
                  disabled={safeIndex === 0}
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <p className="text-center text-xs text-stone-400">
                  Use arrow keys or swipe to navigate · This preview is for
                  on-screen review only.
                </p>
                <Button
                  variant="outline"
                  onClick={goNext}
                  disabled={safeIndex >= pages.length - 1}
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
