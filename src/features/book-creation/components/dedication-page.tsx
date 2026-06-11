"use client";

import { useState } from "react";
import StepIndicator from "@/components/step-indicator";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useBookStore } from "@/features/book-creation/store/book-store";
import { BookStore } from "../types";
import { toast } from "sonner";

const STEPS = ["Setup & Pay", "Cover", "Dedication", "Pages", "Review"];

export default function DedicationPage() {
  const setStep = useBookStore((state: BookStore) => state.setStep);
  const setBookTitle = useBookStore((state: BookStore) => state.setBookTitle);
  const setDedicationText = useBookStore(
    (state: BookStore) => state.setDedicationText,
  );
  const setIncludeDedicationPage = useBookStore(
    (state: BookStore) => state.setIncludeDedicationPage,
  );
  const { bookTitle, dedicationText, includeDedicationPage } = useBookStore();

  const [title, setTitle] = useState(bookTitle || "");
  const [dedication, setDedication] = useState(dedicationText || "");
  const [includeDedie, setIncludeDedie] = useState(
    includeDedicationPage || false,
  );

  const handleContinue = () => {
    if (!title.trim()) {
      toast.error("Book title is required");
      return;
    }
    setBookTitle(title.trim());
    setDedicationText(dedication);
    setIncludeDedicationPage(includeDedie);
    setStep("pages");
  };

  const handleBack = () => {
    // Persist current values before navigating back
    setBookTitle(title);
    setDedicationText(dedication);
    setIncludeDedicationPage(includeDedie);
    setStep("cover");
  };

  const handleStepClick = (index: number) => {
    switch (index) {
      case 0:
        setStep("setup");
        break;
      case 1:
        setStep("cover");
        break;
      case 2:
        break; // Already here
      case 3:
        if (!title.trim()) {
          toast.error("Please enter a book title first");
          return;
        }
        setBookTitle(title.trim());
        setDedicationText(dedication);
        setIncludeDedicationPage(includeDedie);
        setStep("pages");
        break;
      case 4:
        if (!title.trim()) {
          toast.error("Please enter a book title first");
          return;
        }
        setBookTitle(title.trim());
        setDedicationText(dedication);
        setIncludeDedicationPage(includeDedie);
        setStep("review");
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StepIndicator
        steps={STEPS}
        currentStep={2}
        onStepClick={handleStepClick}
      />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Title &amp; Dedication
          </h1>
          <p className="text-gray-500 mb-10">
            Give your book a name and optionally add a personal dedication
            message.
          </p>

          {/* Book Title */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Book Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Amazing Coloring Book"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Dedication toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeDedie}
                onChange={(e) => setIncludeDedie(e.target.checked)}
                className="w-5 h-5 rounded accent-primary cursor-pointer"
              />
              <span className="text-base font-medium text-gray-800">
                Include a dedication page
              </span>
            </label>
          </div>

          {/* Dedication text (conditional) */}
          {includeDedie && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dedication Message
              </label>
              <textarea
                value={dedication}
                onChange={(e) => setDedication(e.target.value)}
                placeholder="To my family, with love..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col-reverse md:flex-row gap-4 justify-between mt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-3 bg-gray-100 text-gray-600 px-8 py-4 rounded-xl font-semibold text-base hover:bg-gray-200 transition-colors h-14"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <button
            onClick={handleContinue}
            className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-orange-600 transition-colors h-14"
          >
            <span>Create the next page</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
