"use client";

import { useState, useEffect } from "react";
import LandingPage from "@/features/book-creation/components/landing-page";
import BookSetupFormatPage from "@/features/book-creation/components/book-setup-format-page";
import CoverPageTestPage from "@/features/book-creation/components/cover-page-test-page";
import ImageUploadPage from "@/features/book-creation/components/image-upload-page";
import FinalizeBookPage from "@/features/book-creation/components/finalize-book-page";
import SuccessPage from "@/features/book-creation/components/success-page";
import { useBookStore } from "@/features/book-creation/store/book-store";
import { BookStore } from "../types";

export default function BookCreation() {
  const step = useBookStore((state: BookStore) => state.step);
  const setStep = useBookStore((state: BookStore) => state.setStep);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Ensure store is hydrated from localStorage
    useBookStore.persist.rehydrate();
    setTimeout(() => setHydrated(true), 0);
  }, []);

  // Handle successful payment return from Stripe
  useEffect(() => {
    if (hydrated) {
      const params = new URLSearchParams(window.location.search);
      const isSuccess = params.get("success") === "true";
      const sessionId = params.get("session_id");

      if (isSuccess) {
        if (sessionId) {
          useBookStore.getState().setOrderId(sessionId);
        }
        useBookStore.getState().setHasPaid(true);
        setStep("images");

        // Clear params from URL without refreshing
        window.history.replaceState({}, "", "/create-book");
      }
    }
  }, [hydrated, setStep]);

  if (!hydrated) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background md:pb-10">
      <main className="flex-1">
        {step === "landing" && <LandingPage />}
        {step === "cover" && <CoverPageTestPage />}
        {step === "setup" && <BookSetupFormatPage />}
        {step === "images" && <ImageUploadPage />}
        {step === "finalize" && <FinalizeBookPage />}
        {step === "success" && <SuccessPage />}
      </main>
    </div>
  );
}
