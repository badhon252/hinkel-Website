"use client";

import { useCallback, useState, useEffect } from "react";
import { ArrowUpFromLine, PrinterCheck } from "lucide-react";
import { useBookStore } from "@/features/book-creation/store/book-store";
import { useGeneratePreview } from "@/features/book-creation/hooks/useGeneratePreview";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ImagePreviewModal from "./image-preview-modal";
import { BookStore } from "../types";
import { toast } from "sonner";
import { useContent } from "@/features/category-page/hooks/use-content";
import { cn } from "@/lib/utils";
import { BookStyleSelector } from "./BookStyleSelector";
import { AuthPromptModal } from "./auth-prompt-modal";

export default function LandingPage() {
  const setStep = useBookStore((state: BookStore) => state.setStep);
  const setCoverImage = useBookStore((state: BookStore) => state.setCoverImage);
  const setCoverImageVariants = useBookStore(
    (state: BookStore) => state.setCoverImageVariants,
  );
  const setSelectedCoverVariant = useBookStore(
    (state: BookStore) => state.setSelectedCoverVariant,
  );
  const incrementCoverGeneration = useBookStore(
    (state: BookStore) => state.incrementCoverGeneration,
  );
  const setBookType = useBookStore((state: BookStore) => state.setBookType);
  const bookType = useBookStore((state: BookStore) => state.bookType);
  const canGenerateCover = useBookStore(
    (state: BookStore) => state.canGenerateCover,
  );
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role?.toLowerCase() === "admin";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Navigation hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // State for categories
  const { data: contentData } = useContent({ limit: 12 });
  const categories = contentData?.data || [];

  // Dropdown persistence logic (extracted but local state management for sync)
  const currentTypeFromUrl = searchParams.get("type");

  // Sync URL to State (Initial & URL changes)
  useEffect(() => {
    const validUrlType =
      currentTypeFromUrl && currentTypeFromUrl.toLowerCase() !== "home"
        ? currentTypeFromUrl
        : null;

    if (validUrlType && validUrlType !== bookType) {
      setBookType(validUrlType);
    } else if (!validUrlType && bookType && bookType.toLowerCase() !== "home") {
      // If store has it but URL doesn't, sync store to URL
      const params = new URLSearchParams(searchParams.toString());
      params.set("type", bookType);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else if (bookType && bookType.toLowerCase() === "home") {
      // Clear invalid "home" type from store if it exists
      setBookType("");
    }
  }, [
    currentTypeFromUrl,
    bookType,
    setBookType,
    pathname,
    router,
    searchParams,
  ]);

  // Handle manual selection
  const handleStyleSelect = useCallback(
    (type: string) => {
      setBookType(type);
      const params = new URLSearchParams(searchParams.toString());
      params.set("type", type);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [setBookType, pathname, router, searchParams],
  );

  // Generate preview hook
  const { generatePreview, loading, error, reset } = useGeneratePreview();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!bookType || bookType.toLowerCase() === "home") {
      toast.error("Please select a book style before uploading.");
      e.target.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setPendingImage(imageData);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow re-upload of same file
    e.target.value = "";
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingImage(null);
    // setStep("cover");
    //TODO:Turn off reset() for Testing purpose
    reset();
  };

  const handleConfirmGeneration = async () => {
    if (!pendingImage) return;

    // Check daily conversion limit (Admins have unlimited)
    if (!isAdmin && !canGenerateCover()) {
      toast.error(
        "Daily conversion limit reached! You can only convert one image for free every 24 hours. Complete your book creation to reset this limit, or try again tomorrow.",
      );
      return;
    }

    const previewResult = await generatePreview(pendingImage, bookType);

    if (previewResult) {
      // Increment cover generation count
      incrementCoverGeneration();

      // Successfully generated
      // 1. Store original image
      setCoverImage(pendingImage);
      // 2. Store preview result in variants
      setCoverImageVariants([previewResult]);
      // 3. Set selected variant to the newly generated one
      setSelectedCoverVariant(0);

      // Reset payment state for new book flow
      useBookStore.getState().setHasPaid(false);
      useBookStore.getState().setOrderId(null);
      // Reset page selections just in case
      useBookStore.getState().setPendingPageCount(null);

      // const remaining =
      //   GENERATION_LIMITS.MAX_COVER - (coverGenerationCount + 1);
      if (isAdmin) {
        toast.success("👑 Admin: Cover generated successfully (Unlimited)!");
      } else {
        toast.success(`Cover generated!`);
      }

      setIsModalOpen(false);
      setPendingImage(null);
      setStep("cover");
    }
    // If failed, error will be shown in modal via the hook's error state
  };

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-background to-background/80 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">✦</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Picture to Sketch Book Creator
          </h1>

          <span className="text-white bg-primary rounded-full px-4 py-1 mb-4 inline-block ">
            <PrinterCheck className="inline-block mr-2 size-4" /> Optimized for
            professional print-on-demand services like Lulu.
          </span>

          <p className="text-lg text-muted-foreground mb-12">
            Transform your images into beautiful sketch coloring books. Upload
            an image, preview the sketch, and create your print-ready book.
          </p>

          <BookStyleSelector
            selectedType={bookType}
            categories={categories}
            onSelect={handleStyleSelect}
          />

          <div className="bg-white rounded-2xl p-12 shadow-sm border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Get Started
            </h2>
            <p className="text-muted-foreground mb-8">
              Upload an image to convert it into a sketch
            </p>

            {isAdmin && (
              <div className="flex justify-center mb-4">
                <span className="text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-600 px-3 py-1 rounded-full border border-orange-200 animate-bounce">
                  👑 Admin: Unlimited Conversions
                </span>
              </div>
            )}

            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onClick={(e) => {
                  if (status === "unauthenticated") {
                    e.preventDefault();
                    setIsAuthModalOpen(true);
                  }
                }}
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                className={cn(
                  "w-full font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all",
                  !bookType || bookType.toLowerCase() === "home"
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : isAdmin
                      ? "bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-[0_0_15px_rgba(255,139,54,0.3)] border-2 border-orange-200"
                      : "bg-primary hover:bg-primary/90 text-white cursor-pointer",
                )}
              >
                <ArrowUpFromLine className="w-5 h-5" />
                Upload Your Image
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl mb-2">📷</div>
                <p className="text-sm font-medium text-foreground">
                  Upload Image
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 10MB
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">✨</div>
                <p className="text-sm font-medium text-foreground">
                  Preview Sketch
                </p>
                <p className="text-xs text-muted-foreground">
                  See AI generated sketches
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📕</div>
                <p className="text-sm font-medium text-foreground">
                  Create Book
                </p>
                <p className="text-xs text-muted-foreground">
                  Configure & order your book
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ImagePreviewModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirmGeneration}
        imagePreview={pendingImage}
        isLoading={loading}
        error={error}
      />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
