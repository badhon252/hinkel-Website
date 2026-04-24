"use client";

import StepIndicator from "@/components/step-indicator";
import { Button } from "@/components/ui/button";
import { useBookStore } from "@/features/book-creation/store/book-store";
import { BookStore } from "../types";
import { generateBookPdf } from "../utils/pdf-generator";
import { useState } from "react";
import { useUploadBook } from "@/features/book-creation/hooks/useUploadBook";
import {
  Eye,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Plus,
  Pencil,
  Info,
  FileText,
  BookOpen,
  Printer,
  LayoutGrid,
  FileImage,
  MessageSquareText,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import AddPagesModal from "./AddPagesModal";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

export default function FinalizeBookPage() {
  const setStep = useBookStore((state: BookStore) => state.setStep);
  const setBookTitle = useBookStore((state: BookStore) => state.setBookTitle);
  const setDedicationText = useBookStore(
    (state: BookStore) => state.setDedicationText,
  );
  const setReturnStep = useBookStore((state: BookStore) => state.setReturnStep);
  const returnStep = useBookStore((state: BookStore) => state.returnStep);
  const state = useBookStore();
  const {
    bookTitle,
    pageCount,
    pageImages,
    pageTexts,
    dedicationText,
    outputFormat,
  } = state;
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddPagesOpen, setIsAddPagesOpen] = useState(false);

  // Handle returning to the step user was at before previewing
  const handleReturnToCreation = () => {
    if (returnStep) {
      const stepToReturn = returnStep;
      setReturnStep(null);
      setStep(stepToReturn);
    } else {
      setStep("pages");
    }
  };

  const { uploadBook, isLoading: isUploading } = useUploadBook();

  const handlePreview = async () => {
    try {
      setIsGenerating(true);
      toast.success("Generating preview...");
      const pdfBlob = await generateBookPdf(state);
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");

      // Clean up the URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("Preview failed:", error);
      toast.error("Failed to generate preview.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = async () => {
    if (!state.orderId) {
      toast.error("Order ID not found. Please complete payment first.");
      return;
    }

    try {
      setIsGenerating(true);
      toast.info("Preparing your book for upload...");

      const pdfBlob = await generateBookPdf(state);

      const response = await uploadBook({
        title: bookTitle || "My Coloring Book",
        image: pdfBlob,
        orderId: state.orderId,
        approvalStatus: "pending",
      });

      if (response.success) {
        useBookStore.getState().resetBook();
        setStep("success");
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const steps = ["Setup & Pay", "Cover", "Dedication", "Pages", "Review"];
  const currentStep = 4;

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
        setStep("pages");
        break;
      case 4:
        // Already here
        break;
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setBookTitle(newTitle);
  };

  const handleDedicationChange = (newText: string) => {
    setDedicationText(newText);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-5 md:p-12">
          <h1 className="text-3xl font-bold mb-2">Review Your Book</h1>
          <p className="text-gray-600 mb-8">
            Review all details before finalizing your book
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                onClick={handlePreview}
                disabled={isGenerating}
                className="group bg-primary hover:bg-orange-600 animate-pulse text-white font-bold rounded-xl h-12 px-6 gap-2 w-full sm:w-auto shadow-lg shadow-primary/20 transition-all hover:scale-105"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 transition-transform group-hover:scale-110" />
                )}
                {isGenerating ? "GENERATING..." : "PREVIEW PDF"}
              </Button>
              <Button
                onClick={handleReturnToCreation}
                variant="outline"
                className="rounded-xl h-12 px-6 gap-2 w-full sm:w-auto border-primary/20 text-primary hover:bg-primary/5"
              >
                <Pencil className="w-4 h-4" />
                EDIT BOOK
              </Button>
            </div>
          </div>

          <div className="space-y-8 mb-12">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Final Review Guide</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Take a moment to review your book&apos;s details. We recommend
                  using the <span className="font-bold">Preview PDF</span>{" "}
                  button to see exactly how your book will look when printed.
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-primary" />
                  Book Metadata
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Book Title
                  </label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50"
                    placeholder="Enter your book title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dedication Text (Optional)
                  </label>
                  <textarea
                    value={dedicationText}
                    onChange={(e) => handleDedicationChange(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 resize-none"
                    placeholder="Add a heartwarming dedication message..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Book Summary
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-none"
                >
                  Final Review
                </Badge>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Pages
                      </p>
                      <p className="text-xl font-bold text-gray-900 flex items-center">
                        {pageCount} Pages
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toast.info("This feature is coming soon.")
                          }
                          className="h-5 w-5 ml-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Printer className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Format
                      </p>
                      <p className="text-xl font-bold text-gray-900 capitalize">
                        {outputFormat === "pdf&printed"
                          ? "Print & PDF"
                          : outputFormat === "printed"
                            ? "Printed Book"
                            : outputFormat === "pdf"
                              ? "Digital PDF"
                              : outputFormat || "Not Selected"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-primary" />
                        Page Details & Content
                      </h4>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Visual overview of your book&apos;s pages and captions
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-none self-start sm:self-center h-7 px-3"
                    >
                      {Object.keys(pageImages).length} of {pageCount} pages Used
                    </Badge>
                  </div>

                  <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100">
                    <TooltipProvider>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
                        {Array.from({ length: pageCount }).map((_, i) => {
                          const pageNum = i + 1;
                          const image = pageImages[pageNum];
                          const text = pageTexts[pageNum];
                          const hasImage = !!image;
                          const hasText = text?.topLine || text?.bottomLine;

                          return (
                            <div
                              key={pageNum}
                              className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all overflow-hidden flex flex-col aspect-[3/4]"
                            >
                              {/* Page Number Badge */}
                              <div className="absolute top-1 right-1 z-10">
                                <Badge
                                  variant="secondary"
                                  className="bg-primary text-white border-none self-start sm:self-center h-6 px-3 text-xs"
                                >
                                  P.{pageNum}
                                </Badge>
                              </div>

                              {/* Status Icons */}
                              <div className="absolute top-2 right-2 z-10 flex gap-1">
                                {hasText && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="p-1 bg-primary/90 rounded text-white shadow-sm">
                                        <MessageSquareText className="w-3 h-3" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="max-w-[200px]"
                                    >
                                      <p className="text-xs font-bold mb-1">
                                        Page Text:
                                      </p>
                                      {text.topLine && (
                                        <p className="text-[10px] line-clamp-2">
                                          T: {text.topLine}
                                        </p>
                                      )}
                                      {text.bottomLine && (
                                        <p className="text-[10px] line-clamp-2">
                                          B: {text.bottomLine}
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>

                              {/* Image Preview */}
                              <div className="flex-1 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                {hasImage ? (
                                  <Image
                                    src={image}
                                    alt={`Page ${pageNum}`}
                                    fill
                                    unoptimized
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center gap-1 text-gray-300">
                                    <FileImage className="w-8 h-8" />
                                    <span className="text-[10px] font-medium">
                                      Empty
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Bottom Text Indicator */}
                              <div
                                className={`h-8 px-2 flex items-center justify-center border-t border-gray-50 ${hasText ? "bg-orange-50/30" : "bg-white"}`}
                              >
                                {hasText ? (
                                  <p className="text-[10px] text-primary font-bold truncate px-1">
                                    {text.topLine || text.bottomLine}
                                  </p>
                                ) : (
                                  <span className="text-[10px] text-gray-300 italic">
                                    No text
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-orange-900 text-lg">
                    Ready to Publish?
                  </h3>
                </div>
                <p className="text-sm text-orange-700">
                  By clicking finalize, you confirm that you have reviewed all
                  pages and the book metadata. Your order will be processed
                  immediately.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={handleReturnToCreation}
                  className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100/50 h-14 px-8 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {returnStep ? "Return to Creation" : "Back"}
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isGenerating || isUploading}
                  className="bg-primary hover:bg-orange-600 text-white transition-all rounded-xl h-14 px-10 font-bold text-lg gap-2 shadow-lg shadow-orange-500/20"
                >
                  {isGenerating || isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>PROCESSING...</span>
                    </>
                  ) : (
                    <>
                      <span>FINALIZE BOOK</span>
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddPagesModal
        isOpen={isAddPagesOpen}
        onClose={() => setIsAddPagesOpen(false)}
      />

      {/* Finalizing Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-xs w-full">
            <Loader2 className="w-12 h-12 text-[#ff8b36] animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Finalizing Book
            </h3>
            <p className="text-gray-500 text-center">
              Please don&apos;t close this window while we finalize your book.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
