"use client";

import type React from "react";
import { useState, useRef } from "react";
import StepIndicator from "@/components/step-indicator";
import { Button } from "@/components/ui/button";
import {
  Upload,
  X,
  Loader2,
  Wand2,
  CheckCircle2,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useBookStore } from "@/features/book-creation/store/book-store";
import type { BookStore } from "@/features/book-creation/types";
import { GENERATION_LIMITS } from "@/features/book-creation/types";
import Image from "next/image";
import { isValidFile, fileToDataURL } from "../utils/file-validation";
import { toast } from "sonner";
import { useGeneratePreview } from "../hooks/useGeneratePreview";
import { generateBookPdf } from "../utils/pdf-generator";
import { cn } from "@/lib/utils";
import AddPagesModal from "./AddPagesModal";

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
    removeUploadedPageImage,
    convertedPageImages,
    addConvertedPageImage,
    removeConvertedPageImage,
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
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const state = useBookStore();
  const { generatePreview, loading: isConverting } = useGeneratePreview();

  const steps = ["Cover Art", "Details", "Payment", "Content", "Review"];
  const currentStep = 3;

  const handleStepClick = (index: number) => {
    switch (index) {
      case 0:
        setStep("cover");
        break;
      case 1:
        setStep("setup");
        break;
      case 3:
        // Already here
        break;
      case 4:
        setStep("finalize");
        break;
    }
  };

  const totalPages = pageCount + (includeDedicationPage ? 1 : 0);

  const handleConvertToLineArt = async (pageNum: number, image: string) => {
    // Check daily conversion limit (Admins have unlimited)
    if (!isAdmin && !canGeneratePage(pageNum)) {
      toast.error(
        "Daily conversion limit reached! You can only convert one image for free every 24 hours. Complete your book creation to reset this limit, or try again tomorrow.",
      );
      return;
    }

    toast.info("Converting to line art...");

    try {
      const lineArtImage = await generatePreview(image, bookType);

      if (lineArtImage) {
        // Increment generation count BEFORE adding the image
        incrementPageGeneration(pageNum);

        // Find and remove the original uploaded image
        const uploadIndex = (uploadedPageImages[pageNum] || []).indexOf(image);
        if (uploadIndex !== -1) {
          removeUploadedPageImage(pageNum, uploadIndex);
        }

        addConvertedPageImage(pageNum, lineArtImage);

        // Auto-select the converted image as the page image
        updatePageImage(pageNum, lineArtImage);

        if (isAdmin) {
          toast.success(
            "👑 Admin: Image converted successfully (Unlimited access)!",
          );
        } else {
          toast.success("Image converted!");
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
      await handleConvertToLineArt(pageNum, imageData);
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

  const handleRemoveUploadedImage = (pageNum: number, index: number) => {
    const image = uploadedPageImages[pageNum]?.[index];
    removeUploadedPageImage(pageNum, index);

    // If the removed image was the selected one, clear or select another
    if (pageImages[pageNum] === image) {
      const remainingImages =
        uploadedPageImages[pageNum]?.filter(
          (_: string, i: number) => i !== index,
        ) || [];
      if (remainingImages.length > 0) {
        updatePageImage(pageNum, remainingImages[0]);
      } else {
        // Fallback to conversions if any
        const conversions = convertedPageImages[pageNum] || [];
        if (conversions.length > 0) {
          updatePageImage(pageNum, conversions[0]);
        } else {
          updatePageImage(pageNum, "");
        }
      }
    }
  };

  const handleRemoveConvertedImage = (pageNum: number, index: number) => {
    const image = convertedPageImages[pageNum]?.[index];
    removeConvertedPageImage(pageNum, index);

    // If the removed image was the selected one, clear or select another
    if (pageImages[pageNum] === image) {
      const remainingConversions =
        convertedPageImages[pageNum]?.filter(
          (_: string, i: number) => i !== index,
        ) || [];
      if (remainingConversions.length > 0) {
        updatePageImage(pageNum, remainingConversions[0]);
      } else {
        // Check if there are uploaded images to fall back to
        const uploaded = uploadedPageImages[pageNum] || [];
        if (uploaded.length > 0) {
          updatePageImage(pageNum, uploaded[0]);
        } else {
          updatePageImage(pageNum, "");
        }
      }
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

  // The active image for the current page from the store
  const activeImage = pageImages[currentPage] || null;

  // Check if the currently active image is one that can be converted (i.e., it's an upload)
  const isConvertible =
    activeImage && currentUploadedImages.includes(activeImage);

  // Handle preview directly with PDF generation
  const handlePreviewBook = async () => {
    try {
      setIsGeneratingPreview(true);
      toast.success("Generating preview...");
      const pdfBlob = await generateBookPdf(state);
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
      toast.success("Preview PDF opened in new tab!");
    } catch (error) {
      console.error("Preview failed:", error);
      toast.error("Failed to generate preview.");
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // const isContinueDisabled = Array.from(
  //   { length: totalPages },
  //   (_, i) => i + 1,
  // ).some((pageNum) => !pageImages[pageNum]);

  return (
    <div className="min-h-screen flex flex-col">
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 md:py-12">
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8 lg:p-12">
          {/* Page selector */}
          <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1;
              const pageImg = pageImages[pageNum];
              const isPageComplete =
                (convertedPageImages[pageNum] || []).length >= 3;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`relative min-w-[64px] h-[64px] rounded-xl border-2 transition-all overflow-hidden flex items-center justify-center group ${
                    currentPage === pageNum
                      ? "border-primary ring-4 ring-primary/10 shadow-lg scale-105"
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
                </button>
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

          {/* Main content grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 xl:gap-12 mt-8 md:mt-12">
            {/* Left Column: Paper Canvas (The actual page editor) */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    Page {currentPage}
                    {hasMaxGenerations && (
                      <span className="text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in">
                        <CheckCircle2 className="w-4 h-4" />
                        Ready to Print
                      </span>
                    )}
                  </h2>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handlePreviewBook}
                    disabled={isGeneratingPreview}
                    variant="outline"
                    className="h-10 px-4 text-sm font-bold border-2 border-primary/30 text-primary hover:bg-primary/5 rounded-xl transition-all flex items-center gap-2"
                  >
                    {isGeneratingPreview ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    {isGeneratingPreview ? "Generating..." : "Preview Book"}
                  </Button>

                  <div
                    className={cn(
                      "text-sm font-black rounded-xl px-5 py-2.5 border transition-all flex items-center gap-2",
                      isAdmin
                        ? "bg-orange-50 border-orange-200 text-orange-700 shadow-sm"
                        : hasMaxGenerations
                          ? "bg-green-50 border-green-200 text-green-700 shadow-sm"
                          : "bg-gray-50 border-gray-200 text-gray-600",
                    )}
                  >
                    {isAdmin && <span>👑</span>}
                    {isAdmin
                      ? "Unlimited Sketches Created"
                      : `${generationsUsed}/${maxConversions} Sketches Created`}
                  </div>
                </div>
              </div>

              <p className="text-sm font-bold text-gray-600 mb-2">
                Upload upto 3 photos, then select which one you like best.
              </p>

              {/* The "Paper" - Mockup of the A4 page */}
              <div className="relative bg-white aspect-[1/1.414] rounded-sm shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-8 flex flex-col items-stretch overflow-hidden group">
                {/* Visual paper edge effect */}
                <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-r from-gray-100/50 to-transparent" />

                {/* Top Text Input Area */}
                <div className="relative mb-6">
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
                    className="w-full text-center text-lg md:text-2xl font-black placeholder:text-gray-200 text-gray-900 bg-transparent border-b-2 border-dashed border-transparent hover:border-gray-100 focus:border-primary focus:bg-primary/5 transition-all outline-none py-2 md:py-4"
                  />
                </div>

                {/* CENTRAL DRAWING AREA (Image Upload/Preview) */}
                <div
                  onDragOver={(e) => !hasMaxGenerations && handleDragOver(e)}
                  onDragLeave={(e) => !hasMaxGenerations && handleDragLeave(e)}
                  onDrop={(e) =>
                    !hasMaxGenerations && handleDrop(e, currentPage)
                  }
                  className={`relative flex-1 rounded-xl border-2 border-dashed transition-all duration-500 flex items-center justify-center ${
                    isDragging
                      ? "border-primary bg-secondary/30 scale-[0.98]"
                      : activeImage
                        ? "border-transparent bg-gray-50/30"
                        : hasMaxGenerations
                          ? "border-gray-100 bg-gray-50/10 grayscale cursor-not-allowed"
                          : "border-gray-200 hover:border-primary/30 bg-gray-50/50 cursor-pointer"
                  }`}
                  onClick={() =>
                    !activeImage &&
                    !hasMaxGenerations &&
                    fileInputRef.current?.click()
                  }
                >
                  {activeImage ? (
                    <div className="relative w-full h-full p-4 animate-in fade-in zoom-in duration-500">
                      <Image
                        src={activeImage}
                        alt={`Page ${currentPage} preview`}
                        fill
                        className="object-contain"
                      />
                      {/* Floating Remove Button inside the canvas for better UX */}
                      {!isConverting && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isConvertible) {
                              const idx =
                                currentUploadedImages.indexOf(activeImage);
                              if (idx !== -1)
                                handleRemoveUploadedImage(currentPage, idx);
                            } else {
                              const idx =
                                currentConvertedImages.indexOf(activeImage);
                              if (idx !== -1)
                                handleRemoveConvertedImage(currentPage, idx);
                            }
                          }}
                          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-50 text-red-500 rounded-lg shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <div
                        className={`p-6 rounded-full shadow-sm mb-6 ${hasMaxGenerations ? "bg-gray-50" : "bg-white border border-gray-100"}`}
                      >
                        {isUploading ? (
                          <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        ) : (
                          <Upload
                            className={`w-12 h-12 transition-colors ${hasMaxGenerations ? "text-gray-200" : "text-primary"}`}
                          />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {isUploading
                          ? "Processing..."
                          : hasMaxGenerations
                            ? "Page Complete"
                            : "Add Your Photo"}
                      </h3>
                      <p className="text-gray-400 max-w-[280px]">
                        {hasMaxGenerations
                          ? "Maximum versions generated for this page."
                          : "Drop your image here or click to browse"}
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

                {/* Bottom Text Input Area */}
                <div className="relative mt-6">
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
                    className="w-full text-center text-lg md:text-2xl font-black placeholder:text-gray-200 text-gray-900 bg-transparent border-t-2 border-dashed border-transparent hover:border-gray-100 focus:border-primary focus:bg-primary/5 transition-all outline-none py-2 md:py-4"
                  />
                </div>

                {/* Page Number Mockup */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-300">
                  PAGE {currentPage}
                </div>
              </div>

              {/* Action Buttons for the active image */}
              {activeImage && isConvertible && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <Button
                    onClick={() =>
                      handleConvertToLineArt(currentPage, activeImage)
                    }
                    disabled={isConverting || hasMaxGenerations}
                    className="w-full h-16 text-xl font-black rounded-2xl bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 hover:scale-[1.01] active:scale-[0.99] text-white shadow-2xl shadow-purple-500/20 transition-all border-none"
                  >
                    {isConverting ? (
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-6 h-6 mr-3" />
                    )}
                    {isConverting
                      ? "Convert Your photo!"
                      : "CONVERT TO LINE ART"}
                  </Button>
                </div>
              )}
            </div>

            {/* Right Column: Library & Sidebar */}
            <div className="space-y-10">
              {/* Section: Your Conversions */}
              <div className="bg-gray-50/50 rounded-[32px] p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black flex items-center gap-3">
                    <Wand2 className="w-5 h-5 text-purple-600" />
                    Converted Photos
                  </h3>
                  <span className="text-xs font-black text-gray-400 bg-white px-3 py-1 rounded-full shadow-xs">
                    {currentConvertedImages.length}/3
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveConvertedImage(currentPage, idx);
                          }}
                          className="absolute top-2 right-2 bg-white/95 text-red-500 p-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section: Recent Uploads */}
              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black flex items-center gap-3">
                    <Upload className="w-5 h-5 text-blue-500" />
                    GALLERY
                  </h3>
                  {!hasMaxGenerations && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary hover:text-primary/70 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {currentUploadedImages.length === 0 ? (
                  <p className="text-xs text-center text-gray-400 py-4 font-bold uppercase tracking-tight">
                    Your uploaded images will appear here
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
                          alt="Upload"
                          className="object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveUploadedImage(currentPage, idx);
                          }}
                          className="absolute top-1 right-1 bg-white/95 text-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-between mt-8 md:mt-16 pt-6 md:pt-10 gap-6 md:gap-0 border-t border-gray-100">
            {/* Back Button (Step Navigation) */}
            <Button
              variant="outline"
              disabled
              className="h-16 px-8 text-xl cursor-not-allowed font-black border-2 border-gray-200 text-gray-400 rounded-2xl hidden md:flex"
            >
              BACK
            </Button>

            {/* Page Navigation Controls (Center) */}
            <div className="flex items-center justify-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100 w-full md:w-auto">
              <Button
                variant="ghost"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-12 w-12 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-30 p-0"
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
                className="h-12 w-12 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-30 p-0"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Next Step Button */}
            <Button
              onClick={() => setStep("finalize")}
              className="h-14 md:h-16 w-full md:w-auto px-8 md:px-12 text-lg md:text-xl font-black bg-[#ff8b36] hover:bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 border-none"
            >
              REVIEW BOOK →
            </Button>
          </div>
        </div>
      </div>
      <AddPagesModal
        isOpen={isAddPagesOpen}
        onClose={() => setIsAddPagesOpen(false)}
      />
    </div>
  );
}
