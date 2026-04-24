"use client";

import { CheckCircle, BookOpenText } from "lucide-react";
// import { useState } from "react";
import { useBookStore } from "@/features/book-creation/store/book-store";
import type { BookStore } from "@/features/book-creation/types";
// import { toast } from "sonner";

// import { generateBookPdf } from "../utils/pdf-generator";

export default function SuccessPage() {
  const resetBook = useBookStore((state: BookStore) => state.resetBook);
  const state = useBookStore();
  const { pageCount, outputFormat } = state;
  // const [isGenerating, setIsGenerating] = useState(false);

  const deliveryMessage = () => {
    switch (outputFormat) {
      case "pdf":
        return "Your PDF coloring book has been created and will be delivered to your email shortly.";
      case "printed":
        return "Your print order has been confirmed. You will receive an email confirmation shortly.";
      case "pdf&printed":
        return "Your coloring book is ready! You will receive a confirmation email for your print order with the PDF file attached.";
      default:
        return "Your coloring book is ready! You should receive an email confirmation shortly.";
    }
  };

  const handleCreateAnother = () => {
    resetBook();
  };

  // const handleDownload = async () => {
  //   try {
  //     setIsGenerating(true);
  //     toast.success("Creating your PDF coloring book...");

  //     const pdfBlob = await generateBookPdf(state);
  //     const url = URL.createObjectURL(pdfBlob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = `${state.bookTitle || "My-Coloring-Book"}.pdf`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     URL.revokeObjectURL(url);

  //     toast.success("Download started!");
  //   } catch (error) {
  //     console.error("PDF generation failed:", error);
  //     toast.error("Failed to generate PDF. Please try again.");
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-background/80 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
          Success!
        </h1>

        <p className="text-xl text-muted-foreground mb-12">
          {outputFormat === "printed"
            ? "Order Confirmed!"
            : "Your coloring book is ready!"}
        </p>

        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-border mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {pageCount}
              </div>
              <p className="text-sm font-medium text-foreground">Total Pages</p>
            </div>
            <div className="p-6 bg-pink-50 rounded-lg">
              <div className="text-2xl mb-2">✓</div>
              <p className="text-sm font-medium text-foreground">
                <span className="text-blue-600 font-bold capitalize">
                  {outputFormat === "pdf"
                    ? "Digital PDF"
                    : outputFormat === "printed"
                      ? "Print Order"
                      : "PDF & Print"}
                </span>
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-foreground font-medium mb-2">
              Great job creating your book! We hope you enjoy it.
            </p>
            <p className="text-sm text-muted-foreground">{deliveryMessage()}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full bg-[#ff8b36] hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-lg shadow-orange-500/20"
          >
            {isGenerating ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Download className="w-6 h-6" />
            )}
            {isGenerating ? "Generating PDF..." : "Download color book"}
          </button> */}

          <button
            onClick={handleCreateAnother}
            className="w-full hover:text-primary hover:bg-muted hover:border hover:border-primary bg-primary text-white cursor-pointer duration-300 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpenText className="w-5 h-5" />
            Create Another Book
          </button>
        </div>
      </div>
    </div>
  );
}
