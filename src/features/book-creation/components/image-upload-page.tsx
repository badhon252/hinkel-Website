"use client";

import type React from "react";
import { useState, useRef } from "react";
import StepIndicator from "@/components/step-indicator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Loader2,
  Wand2,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useBookStore } from "@/features/book-creation/store/book-store";
import type { BookStore } from "@/features/book-creation/types";
import { GENERATION_LIMITS } from "@/features/book-creation/types";
import Image from "next/image";
import { isValidFile, fileToDataURL } from "../utils/file-validation";
import { toast } from "sonner";
import { useGeneratePreview } from "../hooks/useGeneratePreview";
import { cn } from "@/lib/utils";
import AddPagesModal from "./AddPagesModal";
import BookPreviewModal from "./BookPreviewModal";
import { useContent } from "@/features/category-page/hooks/use-content";
import { getCategoryPromptForType } from "../utils/prompt";

export default function ImageUploadPage() {
  const setStep = useBookStore((state: BookStore) => state.setStep);
  const updatePageImage = useBookStore(
    (state: BookStore) => state.updatePageImage,
  );
  const {
    pageCount,
    includeDedicationPage,
    pageImages,
    uploadedPageImages,
    addUploadedPageImage,
    convertedPageImages,
    addConvertedPageImage,
    pageTexts,
    updatePageText,
    incrementPageGeneration,
    canGeneratePage,
    getPageGenerationCount,
    bookType,
  } = useBookStore();

  const { data: session } = useSession();
  const isAdmin = session?.user?.role?.toLowerCase() === "admin";

  const [currentPage, setCurrentPage] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddPagesOpen, setIsAddPagesOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { generatePreview, loading: isConverting } = useGeneratePreview();
  const { data: contentData } = useContent({ limit: 12 });
  const categories = contentData?.data || [];
  const selectedStylePrompt = getCategoryPromptForType(categories, bookType);

  const steps = ["Setup & Pay", "Cover", "Dedication", "Pages", "Review"];
  const currentStep = 3;

  const handleStepClick = (index: number) => {
    switch (index) {
      case 0:
        setStep("setup");
        break;
      case 1:
        setStep("cover");
        break;
      case 2:
        setStep("dedication");
        break;
      case 3:
        // Already here
        break;
      case 4:
        setStep("review");
        break;
    }
  };

  const totalPages = pageCount + (includeDedicationPage ? 1 : 0);

  const handleConvertToLineArt = async (pageNum: number, image: string) => {
    if (!isAdmin && !canGeneratePage(pageNum)) {
      toast.error(
        `You have already used all ${GENERATION_LIMITS.MAX_PER_PAGE} tries for this page. Please choose the image you like best.`,
      );
      return;
    }

    toast.info("Converting to line art...");

    try {
      const lineArtImage = await generatePreview(
        image,
        bookType,
        selectedStylePrompt,
      );

      if (lineArtImage) {
        // Increment generation count BEFORE adding the image
        incrementPageGeneration(pageNum);

        addConvertedPageImage(pageNum, lineArtImage);

        // Auto-select the converted image as the page image
        updatePageImage(pageNum, lineArtImage);

        if (isAdmin) {
          toast.success(
            "👑 Admin: Image converted successfully (Unlimited access)!",
          );
        } else {
          const triesUsed = getPageGenerationCount(pageNum) + 1;
          toast.success(
            `Option ${triesUsed} of ${GENERATION_LIMITS.MAX_PER_PAGE} is ready. Compare the results and keep the one you love best.`,
          );
        }
      } else {
        toast.error("Failed to convert image. Please try again.");
      }
    } catch (err) {
      console.error("Conversion error:", err);
      toast.error("Failed to convert image. Please try again.");
    }
  };

  const handleFileUploadLogic = async (file: File, pageNum: number) => {
    // Check if limit reached (max 3 images)
    const currentImages = uploadedPageImages[pageNum] || [];
    if (currentImages.length >= 3) {
      toast.error(
        "Maximum 3 images allowed per page. Please remove an image to upload a new one.",
      );
      return;
    }

    const validation = isValidFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    toast.info("Uploading image...");
    setIsUploading(true);

    try {
      // Simulate a small delay for "uploading" feel
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const imageData = await fileToDataURL(file);

      // Add to uploaded list
      addUploadedPageImage(pageNum, imageData);

      // ALWAYS select the newly uploaded image as the active page image
      updatePageImage(pageNum, imageData);

      toast.success("Image uploaded successfully!");

      // Auto-trigger conversion to sketch version
      // await handleConvertToLineArt(pageNum, imageData);
    } catch (err) {
      console.error("Image processing error:", err);
      toast.error("Failed to process image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    pageNum: number,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUploadLogic(file, pageNum);
    }
    // Reset input value so the same file can be selected again
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, pageNum: number) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUploadLogic(file, pageNum);
    }
  };

  const handleSelectImage = (pageNum: number, image: string) => {
    updatePageImage(pageNum, image);
  };

  const currentUploadedImages = uploadedPageImages[currentPage] || [];
  const currentConvertedImages = convertedPageImages[currentPage] || [];

  // Use store tracking for generation limits (persists even after removing images)
  const generationsUsed = getPageGenerationCount(currentPage);
  const hasMaxGenerations = !canGeneratePage(currentPage);
  const maxConversions = GENERATION_LIMITS.MAX_PER_PAGE;
  const triesLeft = Math.max(0, maxConversions - generationsUsed);
  const hasGeneratedOptions = currentConvertedImages.length > 0;

  // The active image for the current page from the store
  const activeImage = pageImages[currentPage] || null;

  // const pageReady = Boolean(activeImage) && hasGeneratedOptions;
  // const workflowSteps = [
  //   {
  //     title: "Upload a source image",
  //     description: "Start with a clean photo or illustration for this page.",
  //     complete: currentUploadedImages.length > 0,
  //   },
  //   {
  //     title: "Generate sketch options",
  //     description: "Turn the active source into printable sketch variations.",
  //     complete: currentConvertedImages.length > 0,
  //   },
  //   {
  //     title: "Choose your favorite",
  //     description: "Keep the best option selected before moving forward.",
  //     complete: pageReady,
  //   },
  // ];

  // Check if the currently active image is one that can be converted (i.e., it's an upload)
  const isConvertible =
    activeImage && currentUploadedImages.includes(activeImage);

  const handlePreviewBook = () => {
    setIsPreviewOpen(true);
  };

  // const isContinueDisabled = Array.from(
  //   { length: totalPages },
  //   (_, i) => i + 1,
  // ).some((pageNum) => !pageImages[pageNum]);

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(180deg,#fffaf4_0%,#ffffff_32%,#fffdf9_100%)]">
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Top Preview Button Popup - Only on last page */}
      {currentPage === totalPages && (
        <div className="sticky top-0 z-[500] w-full flex justify-center pt-4 pointer-events-none animate-in slide-in-from-top-full duration-500">
          <Button
            onClick={handlePreviewBook}
            className="pointer-events-auto h-12 px-8 text-sm font-black bg-primary hover:bg-primary/90 text-white rounded-full shadow-2xl shadow-primary/40 flex items-center gap-2 border-none transform transition-all hover:scale-105 active:scale-95"
          >
            <Eye className="w-4 h-4" />
            Preview book
          </Button>
        </div>
      )}

      <div className="mx-auto flex-1 w-full max-w-7xl px-4 py-5 md:px-6 md:py-10 xl:px-8">
        <div className="rounded-[32px] border border-stone-200/80 bg-white/95 p-4 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm md:p-8 lg:p-10">
          {/* <div className="mb-8 flex flex-col gap-4 md:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex w-fit items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-orange-700">
                Page creation
              </span>
              <div className="space-y-2">
                <h1 className="text-2xl font-black tracking-tight text-stone-900 md:text-4xl">
                  Build each page with more space and less guesswork
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
                  Upload a source image, generate sketch options, and keep the
                  best version selected. The workspace is streamlined so your
                  actions and results stay visible on every screen size.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-fit">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Current page
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-950">
                  {currentPage}
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">
                  Tries used
                </p>
                <p className="mt-1 text-2xl font-black text-stone-900">
                  {isAdmin ? "∞" : `${generationsUsed}/${maxConversions}`}
                </p>
              </div>
            </div>
          </div> */}

          {/* Page selector */}
          <div className="mb-8 overflow-x-auto rounded-[28px] border border-stone-200 bg-stone-50/80 p-3 pb-4 shadow-inner shadow-stone-100 scrollbar-hide md:mb-10">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                  Pages
                </p>
                <p className="text-sm font-semibold text-stone-700">
                  Jump between pages without losing your selected sketches
                </p>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNum = index + 1;
                const pageImg = pageImages[pageNum];
                const isPageComplete =
                  (convertedPageImages[pageNum] || []).length >= 3;

                return (
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative min-w-[64px] h-[64px] rounded-xl border-2 transition-all overflow-hidden flex items-center justify-center group ${
                      currentPage === pageNum
                        ? "border-primary ring-4 ring-primary/10 shadow-lg scale-105 text-white"
                        : pageImg
                          ? "border-gray-200 hover:border-primary/50"
                          : "border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/50"
                    }`}
                  >
                    {pageImg ? (
                      <>
                        <Image
                          src={pageImg}
                          alt={`Page ${pageNum}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                        <div
                          className={`absolute inset-0 bg-black/10 transition-opacity ${currentPage === pageNum ? "opacity-0" : "group-hover:opacity-0"}`}
                        />
                        <span
                          className={`absolute bottom-0 right-0 bg-primary/90 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md font-bold transition-transform ${currentPage === pageNum ? "scale-110" : ""}`}
                        >
                          {pageNum}
                        </span>
                      </>
                    ) : (
                      <span
                        className={`text-sm font-bold ${currentPage === pageNum ? "text-primary" : "text-gray-400"}`}
                      >
                        {pageNum}
                      </span>
                    )}

                    {isPageComplete && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white p-0.5 rounded-bl-md shadow-sm">
                        <Wand2 className="w-3 h-3" />
                      </div>
                    )}
                  </Button>
                );
              })}

              {/* Add Extra Pages Button */}
              <button
                onClick={() => toast.info("This feature is coming soon.")}
                className="relative min-w-[64px] h-[64px] rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 hover:border-orange-400 transition-all flex items-center justify-center group"
                title="Add extra pages"
              >
                <Plus className="w-6 h-6 text-orange-600 transition-transform group-hover:scale-125" />
              </button>
            </div>
          </div>

          {/* Main content grid */}
          <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,420px)] xl:items-start">
            {/* Left Column: Page workspace */}
            <div className="space-y-6 md:space-y-8">
              <div className="rounded-[28px] border border-stone-200 bg-[linear-gradient(135deg,#fffdf8_0%,#ffffff_48%,#f8fbff_100%)] p-5 shadow-sm md:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-orange-600">
                      Workspace
                    </p>
                    {/* <h2 className="flex items-center gap-3 text-2xl font-black text-stone-900 md:text-3xl">
                      Page {currentPage} editor
                      {hasMaxGenerations && (
                        <span className="animate-in zoom-in rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700 fade-in flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Ready to Print
                        </span>
                      )}
                    </h2> */}
                    <p className="max-w-2xl text-sm leading-7 text-stone-600">
                      {isAdmin
                        ? "Admin mode: you can keep generating as many versions as you need."
                        : hasMaxGenerations
                          ? `You have used all ${maxConversions} tries for this page. Review your options below and keep your favorite selected.`
                          : `You have ${triesLeft} of ${maxConversions} tries left on this page to get the perfect image.`}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={handlePreviewBook}
                      variant="outline"
                      className="h-11 rounded-2xl border-2 border-primary/25 px-4 text-sm font-bold text-primary transition-all hover:bg-primary/5"
                    >
                      <Eye className="w-4 h-4" />
                      Preview book
                    </Button>

                    <div
                      className={cn(
                        "flex min-w-[180px] items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-black transition-all",
                        isAdmin
                          ? "bg-orange-50 border-orange-200 text-orange-700 shadow-sm"
                          : hasMaxGenerations
                            ? "bg-green-50 border-green-200 text-green-700 shadow-sm"
                            : "bg-gray-50 border-gray-200 text-gray-600",
                      )}
                    >
                      {isAdmin && <span>👑</span>}
                      {isAdmin
                        ? "Unlimited"
                        : `${generationsUsed}/${maxConversions} Tries Used`}
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="grid gap-3 md:grid-cols-3">
                {workflowSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className={cn(
                      "rounded-[24px] border p-4 shadow-sm transition-all",
                      step.complete
                        ? "border-emerald-200 bg-emerald-50/80"
                        : "border-stone-200 bg-white",
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-black",
                          step.complete
                            ? "bg-emerald-600 text-white"
                            : "bg-stone-100 text-stone-500",
                        )}
                      >
                        {step.complete ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                        {step.complete ? "Done" : "Next"}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-stone-500">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div> */}

              {/* <div className="flex items-start gap-3 rounded-[24px] border border-blue-100 bg-blue-50/90 px-4 py-4 shadow-sm">
                <ImagePlus className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <p className="text-sm font-medium leading-7 text-blue-950">
                  {hasGeneratedOptions
                    ? "Your sketch options are safely saved below. Upload another source image only when you want a fresh direction for this page."
                    : "Upload one source image to begin. As soon as the sketch is ready, this workspace will guide you through the next action."}
                </p>
              </div> */}

              <div className="overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.32)]">
                <div className="border-b border-stone-200 bg-stone-50/80 px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">
                        Live page layout
                      </p>
                      {/* <p className="mt-1 text-sm font-semibold text-stone-800">
                        Shorter preview, clearer actions, and room for captions
                      </p> */}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-500 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                      {activeImage
                        ? "Active image selected"
                        : "Waiting for your first upload"}
                    </div>
                  </div>
                </div>

                <div className="relative bg-[linear-gradient(180deg,#ffffff_0%,#fffdfa_100%)] p-4 sm:p-6 lg:p-7">
                  <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-r from-stone-100/70 to-transparent" />

                  <div className="relative mb-5">
                    <input
                      type="text"
                      placeholder="CLICK TO ADD TOP Captions..."
                      value={pageTexts[currentPage]?.topLine || ""}
                      onChange={(e) =>
                        updatePageText(
                          currentPage,
                          e.target.value,
                          pageTexts[currentPage]?.bottomLine || "",
                        )
                      }
                      className="w-full rounded-2xl border border-transparent bg-transparent px-4 py-3 text-center text-lg font-black text-stone-900 transition-all outline-none placeholder:text-stone-300 hover:border-stone-200 hover:bg-white/90 focus:border-primary focus:bg-primary/5 md:text-2xl"
                    />
                  </div>

                  <div
                    onDragOver={(e) => !hasMaxGenerations && handleDragOver(e)}
                    onDragLeave={(e) =>
                      !hasMaxGenerations && handleDragLeave(e)
                    }
                    onDrop={(e) =>
                      !hasMaxGenerations && handleDrop(e, currentPage)
                    }
                    className={`relative flex min-h-[260px] items-center justify-center rounded-[28px] border-2 border-dashed transition-all duration-500 sm:min-h-[320px] xl:min-h-[340px] ${
                      isDragging
                        ? "scale-[0.99] border-primary bg-secondary/30"
                        : activeImage
                          ? "border-stone-200 bg-stone-50/50"
                          : hasMaxGenerations
                            ? "cursor-not-allowed border-gray-100 bg-gray-50/20 grayscale"
                            : "cursor-pointer border-gray-200 bg-gray-50/70 hover:border-primary/30"
                    }`}
                    onClick={() =>
                      !activeImage &&
                      !hasMaxGenerations &&
                      fileInputRef.current?.click()
                    }
                  >
                    {activeImage ? (
                      <div className="relative h-full min-h-[240px] w-full animate-in p-4 duration-500 fade-in zoom-in sm:p-6">
                        <Image
                          src={activeImage}
                          alt={`Page ${currentPage} preview`}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex max-w-sm flex-col items-center justify-center p-8 text-center sm:p-12">
                        <div
                          className={`mb-6 rounded-full p-5 shadow-sm ${hasMaxGenerations ? "bg-gray-50" : "border border-gray-100 bg-white"}`}
                        >
                          {isUploading ? (
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                          ) : (
                            <Upload
                              className={`h-12 w-12 transition-colors ${hasMaxGenerations ? "text-gray-200" : "text-primary"}`}
                            />
                          )}
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-stone-900">
                          {isUploading
                            ? "Processing..."
                            : hasMaxGenerations
                              ? "Page Complete"
                              : "Upload Your First Image"}
                        </h3>
                        <p className="leading-7 text-stone-400">
                          {hasMaxGenerations
                            ? "You already have the maximum number of sketch options for this page."
                            : "Drop your image here or click once to browse"}
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png,image/jpeg"
                      onChange={(e) => handleImageUpload(e, currentPage)}
                      className="hidden"
                    />
                  </div>

                  {/* <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-500">
                    <span className="rounded-full bg-stone-100 px-3 py-1">
                      Caption zones enabled
                    </span>
                    <span className="rounded-full bg-stone-100 px-3 py-1">
                      Optimized for touch and drag-drop
                    </span>
                    <span className="rounded-full bg-stone-100 px-3 py-1">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div> */}
                </div>

                <div className="relative border-t border-stone-100 bg-white px-4 py-5 sm:px-6 lg:px-7">
                  <input
                    type="text"
                    placeholder="CLICK TO ADD BOTTOM Captions..."
                    value={pageTexts[currentPage]?.bottomLine || ""}
                    onChange={(e) =>
                      updatePageText(
                        currentPage,
                        pageTexts[currentPage]?.topLine || "",
                        e.target.value,
                      )
                    }
                    className="w-full rounded-2xl border border-transparent bg-transparent px-4 py-3 text-center text-lg font-black text-stone-900 transition-all outline-none placeholder:text-stone-300 hover:border-stone-200 hover:bg-stone-50 focus:border-primary focus:bg-primary/5 md:text-2xl"
                  />
                </div>
              </div>

              <div className="grid gap-3 animate-in duration-500 slide-in-from-bottom-4">
                {activeImage && isConvertible && (
                  <Button
                    onClick={() =>
                      handleConvertToLineArt(currentPage, activeImage)
                    }
                    disabled={isConverting || hasMaxGenerations}
                    className="h-16 w-full rounded-[24px] border-none bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 text-xl font-black text-white shadow-2xl shadow-purple-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isConverting ? (
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-6 h-6 mr-3" />
                    )}
                    {isConverting
                      ? "Generating Sketch..."
                      : "Generate Sketch from This Image"}
                  </Button>
                )}

                {!hasMaxGenerations && hasGeneratedOptions && (
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isConverting}
                    className="h-14 w-full rounded-[24px] border-2 border-primary/20 font-semibold text-primary hover:bg-primary/5"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 mr-2" />
                    )}
                    Upload Another Image
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column: Library & Sidebar */}
            <div className="space-y-6 xl:sticky xl:top-28">
              {/* Section: Your Conversions */}
              <div className="rounded-[32px] border border-gray-100 bg-gray-50/60 p-6 shadow-sm md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black flex items-center gap-3">
                    <Wand2 className="w-5 h-5 text-purple-600" />
                    All Sketched - Select ONE
                  </h3>
                  <span className="text-xs font-black text-gray-400 bg-white px-3 py-1 rounded-full shadow-xs">
                    {currentConvertedImages.length}/{maxConversions}
                  </span>
                </div>

                {currentConvertedImages.length === 0 ? (
                  <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                    <p className="text-sm font-bold">No sketches yet.</p>
                    <p className="text-xs mt-1">Upload and convert an image!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {currentConvertedImages.map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className={`group relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                          activeImage === img
                            ? "border-primary ring-4 ring-primary/10 scale-105"
                            : "border-white hover:border-primary/40"
                        }`}
                        onClick={() => handleSelectImage(currentPage, img)}
                      >
                        <Image
                          fill
                          src={img}
                          alt="Sketch"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section: Recent Uploads */}
              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black flex items-center gap-3">
                    <Upload className="w-5 h-5 text-blue-500" />
                    Source Images
                  </h3>
                </div>

                {currentUploadedImages.length === 0 ? (
                  <p className="text-xs text-center text-gray-400 py-4 font-bold uppercase tracking-tight">
                    Your current source image will appear here before sketching
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {currentUploadedImages.map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          activeImage === img
                            ? "border-primary ring-2 ring-primary/10"
                            : "border-gray-50 hover:border-blue-400/40 shadow-xs"
                        }`}
                        onClick={() => handleSelectImage(currentPage, img)}
                      >
                        <Image
                          fill
                          src={img}
                          alt="Source"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm font-semibold text-stone-500">
            Select ONE photo from the &ldquo;All Sketches&rdquo; box and move to
            the next page.
          </p>

          {/* Navigation buttons */}
          <div className="mt-4 flex flex-col-reverse items-center justify-between gap-6 border-t border-gray-100 pt-6 md:mt-6 md:flex-row md:gap-0 md:pt-10">
            {/* Back Button (Step Navigation) */}

            <Button
              variant="outline"
              onClick={() => setStep("dedication")}
              className="h-16 px-8 text-xl font-black border-2 border-gray-200 text-gray-600 rounded-2xl hidden md:flex hover:bg-gray-50"
            >
              BACK
            </Button>

            {/* Page Navigation Controls (Center) */}
            <div className="flex items-center justify-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100 w-full md:w-auto">
              <Button
                variant="ghost"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-12 w-12 rounded-xl bg-primary hover:bg-white hover:shadow-sm disabled:opacity-30 p-0"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <span className="text-sm font-black text-gray-500 min-w-[100px] text-center">
                PAGE {currentPage} / {totalPages}
              </span>

              <Button
                variant="ghost"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="h-12 w-12 rounded-xl bg-primary hover:bg-white hover:shadow-sm disabled:opacity-30 p-0"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Next Step Button - Only on last page */}
            {currentPage === totalPages ? (
              <Button
                onClick={() => setStep("review")}
                className="h-14 md:h-16 w-full md:w-auto px-8 md:px-12 text-lg md:text-xl font-black bg-[#ff8b36] hover:bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 border-none"
              >
                REVIEW BOOK →
              </Button>
            ) : (
              <div className="w-full md:w-[220px]" /> // Spacer to keep layout consistent
            )}
          </div>
        </div>
      </div>
      <AddPagesModal
        isOpen={isAddPagesOpen}
        onClose={() => setIsAddPagesOpen(false)}
      />
      <BookPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
