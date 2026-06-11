"use client";

import { useCallback, useState, useEffect } from "react";
import {
  ArrowUpFromLine,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Camera,
  CreditCard,
  PackageCheck,
  BookOpen,
  WandSparkles,
} from "lucide-react";
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
import Image from "next/image";
import { getCategoryPromptForType } from "../utils/prompt";
import { GENERATION_LIMITS } from "../types";

export default function FreeGenerationPage() {
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
  const { coverImageVariants, selectedCoverVariantIndex, generationCounts } =
    useBookStore();

  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role?.toLowerCase() === "admin";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { data: contentData } = useContent({ limit: 12 });
  const categories = contentData?.data || [];
  const selectedStylePrompt = getCategoryPromptForType(categories, bookType);

  const freeGenerationsUsed = generationCounts.cover;
  const canGenerate = isAdmin || canGenerateCover();
  const introSteps = [
    {
      icon: Camera,
      title: "Free cover photos",
      description:
        "Upload your first two photos for free and select the cover you love most.",
    },
    {
      icon: PackageCheck,
      title: "Choose delivery",
      description: "Pick PDF, Print, or PDF + Print as your preferred format.",
    },
    {
      icon: CreditCard,
      title: "Start creating",
      description: "Process payment and begin the book creation process.",
    },
  ];
  const previewSteps = [
    {
      icon: Camera,
      title: "Upload Photo",
      description: "PNG, JPG, or WEBP up to 10MB",
    },
    {
      icon: WandSparkles,
      title: "Get Sketch",
      description: "Preview an AI-made cover option",
    },
    {
      icon: BookOpen,
      title: "Build Book",
      description: "Choose your favorite, then continue",
    },
  ];

  const currentTypeFromUrl = searchParams.get("type");

  useEffect(() => {
    const validUrlType =
      currentTypeFromUrl && currentTypeFromUrl.toLowerCase() !== "home"
        ? currentTypeFromUrl
        : null;

    if (validUrlType && validUrlType !== bookType) {
      setBookType(validUrlType);
    } else if (!validUrlType && bookType && bookType.toLowerCase() !== "home") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("type", bookType);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else if (bookType && bookType.toLowerCase() === "home") {
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

  const handleStyleSelect = useCallback(
    (type: string) => {
      setBookType(type);
      const params = new URLSearchParams(searchParams.toString());
      params.set("type", type);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [setBookType, pathname, router, searchParams],
  );

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
    e.target.value = "";
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingImage(null);
    reset();
  };

  const handleConfirmGeneration = async () => {
    if (!pendingImage) return;

    if (!isAdmin && !canGenerateCover()) {
      toast.error(
        `You have used all ${GENERATION_LIMITS.MAX_COVER} free cover tries. Continue to book setup to keep building your book.`,
      );
      setIsModalOpen(false);
      return;
    }

    const previewResult = await generatePreview(
      pendingImage,
      bookType,
      selectedStylePrompt,
    );

    if (previewResult) {
      incrementCoverGeneration();

      // Append the new sketch to existing variants
      const updatedVariants = [...coverImageVariants, previewResult];
      setCoverImage(pendingImage);
      setCoverImageVariants(updatedVariants);
      setSelectedCoverVariant(updatedVariants.length - 1);

      // Reset payment state for new book
      useBookStore.getState().setHasPaid(false);
      useBookStore.getState().setOrderId(null);
      useBookStore.getState().setPendingPageCount(null);

      const used = freeGenerationsUsed + 1;
      toast.success(
        isAdmin
          ? "👑 Admin: Sketch generated!"
          : `Cover option ${used} of ${GENERATION_LIMITS.MAX_COVER} is ready. Pick the one you like best.`,
      );

      setIsModalOpen(false);
      setPendingImage(null);
    }
  };

  const handleSelectVariant = (index: number) => {
    setSelectedCoverVariant(index);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Try Before You Buy
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get started creating your custom book
            </h1>
            <p className="text-lg text-muted-foreground">
              Convert your first {GENERATION_LIMITS.MAX_COVER} photos for free,
              before moving forward in the book creation process
            </p>
            <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
              {introSteps.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-orange-100 bg-white/85 p-4 shadow-sm shadow-orange-950/5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{title}</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <BookStyleSelector
            selectedType={bookType}
            categories={categories}
            onSelect={handleStyleSelect}
          />

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
            <div className="mb-6 rounded-2xl border border-orange-100 bg-orange-50 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-900">
                    <b>Cover page: </b>
                    Upload your first two FREE photos and see them turn into
                    sketch art!
                  </p>
                </div>
                {!isAdmin && (
                  <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm">
                    {freeGenerationsUsed} of {GENERATION_LIMITS.MAX_COVER} tries
                    used
                  </div>
                )}
              </div>
            </div>

            {/* Generation counter header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {isAdmin ? "Generate Sketches (Admin)" : "Free Sketch Previews"}
              </h2>
              {!isAdmin && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {Array.from({ length: GENERATION_LIMITS.MAX_COVER }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all ${
                          i < freeGenerationsUsed
                            ? "bg-orange-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ),
                  )}
                  <span className="text-sm font-semibold text-gray-500">
                    {freeGenerationsUsed}/{GENERATION_LIMITS.MAX_COVER} used
                  </span>
                </div>
              )}
            </div>

            {/* Upload button */}
            <label
              className={cn(
                "block",
                !canGenerate && !isAdmin
                  ? "opacity-60 pointer-events-none"
                  : "cursor-pointer",
              )}
            >
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
                disabled={!canGenerate && !isAdmin}
              />
              <div
                className={cn(
                  "w-full font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border-2 border-dashed",
                  !bookType || bookType.toLowerCase() === "home"
                    ? "bg-muted text-muted-foreground cursor-not-allowed border-gray-200"
                    : canGenerate || isAdmin
                      ? "bg-primary/5 border-primary text-primary hover:bg-primary hover:text-white"
                      : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed",
                )}
              >
                <ArrowUpFromLine className="w-5 h-5" />
                {canGenerate || isAdmin
                  ? "Upload Photo for a Cover Try"
                  : `${GENERATION_LIMITS.MAX_COVER}/${GENERATION_LIMITS.MAX_COVER} Cover Tries Used — Continue Below`}
              </div>
            </label>

            {/* Generated sketches gallery */}
            {coverImageVariants.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Your Cover Options — Pick Your Favourite
                </p>
                <div
                  className={`grid gap-4 ${
                    coverImageVariants.length === 1
                      ? "grid-cols-1 max-w-xs mx-auto"
                      : "grid-cols-2"
                  }`}
                >
                  {coverImageVariants.map((variant, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectVariant(index)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        selectedCoverVariantIndex === index
                          ? "border-primary ring-4 ring-primary/20 scale-[1.02]"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      <Image
                        src={variant}
                        alt={`Sketch ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {selectedCoverVariantIndex === index && (
                        <div className="absolute top-2 right-2 bg-primary rounded-full p-1 shadow">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1.5 font-semibold">
                        Sketch {index + 1}
                        {selectedCoverVariantIndex === index &&
                          " — Selected as Cover"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How-it-works row (only before any generation) */}
            {coverImageVariants.length === 0 && (
              <div className="mt-8 border-t border-border pt-8">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    What happens next
                  </p>
                  <div className="hidden h-px flex-1 bg-gradient-to-r from-orange-100 to-transparent sm:block" />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {previewSteps.map(
                    ({ icon: Icon, title, description }, index) => (
                      <div
                        key={title}
                        className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-left transition-all hover:border-orange-200 hover:bg-white hover:shadow-sm"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm ring-1 ring-orange-100">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-black text-orange-700">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Continue button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep("setup")}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-base transition-all h-14",
                coverImageVariants.length > 0
                  ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200",
              )}
            >
              <span>
                {coverImageVariants.length > 0
                  ? "Continue to Book Setup"
                  : "Skip to Book Setup"}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <ImagePreviewModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirmGeneration}
        imagePreview={pendingImage}
        isLoading={loading}
        error={error}
      />

      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
