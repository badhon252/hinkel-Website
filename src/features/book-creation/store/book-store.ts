import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { indexedDbStorage } from "@/lib/indexed-db-storage";
import { GENERATION_LIMITS } from "../types";
import type { BookState, BookStore } from "../types";
import { resolveAccessibleStep } from "../utils/step-flow";

export type BookStep =
  | "free-generation"
  | "setup"
  | "cover"
  | "dedication"
  | "pages"
  | "review"
  | "success";

const initialState: BookState = {
  step: "free-generation",
  returnStep: null,
  isHydrated: false,
  bookTitle: "",
  pageCount: 20,
  includeDedicationPage: false,
  outputFormat: null,
  coverImage: null,
  coverImageVariants: [],
  selectedCoverVariantIndex: null,
  pageImages: {},
  pageTexts: {},
  uploadedPageImages: {},
  convertedPageImages: {},
  generationCounts: {
    cover: 0,
    pages: {},
    lastGenerationDate: null,
  },
  dedicationText: "",
  hasPaid: false,
  orderId: null,
  stripeSessionId: null,
  pendingPageCount: null,
  pendingCheckoutIntent: null,
  pendingResumeStep: null,
  bookType: "kids",
};

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) =>
        set((state) => ({
          step: resolveAccessibleStep(state, step),
        })),
      setReturnStep: (returnStep) => set({ returnStep }),
      setHydrated: (isHydrated) => set({ isHydrated }),
      setBookTitle: (bookTitle) => set({ bookTitle }),
      setPageCount: (pageCount) => set({ pageCount }),
      setIncludeDedicationPage: (includeDedicationPage) =>
        set({ includeDedicationPage }),
      setOutputFormat: (outputFormat) => set({ outputFormat }),
      setCoverImage: (coverImage) => set({ coverImage }),
      setCoverImageVariants: (coverImageVariants) =>
        set({ coverImageVariants }),
      setSelectedCoverVariant: (selectedCoverVariantIndex) =>
        set({ selectedCoverVariantIndex }),
      setPageImages: (pageImages) => set({ pageImages }),
      updatePageImage: (pageNum, image) =>
        set((state) => ({
          pageImages: {
            ...state.pageImages,
            [pageNum]: image,
          },
        })),
      updatePageText: (pageNum, topLine, bottomLine) =>
        set((state) => ({
          pageTexts: {
            ...state.pageTexts,
            [pageNum]: { topLine, bottomLine },
          },
        })),
      setUploadedPageImages: (uploadedPageImages) =>
        set({ uploadedPageImages }),
      addUploadedPageImage: (pageNum, image) =>
        set((state) => {
          const currentImages = state.uploadedPageImages[pageNum] || [];
          return {
            uploadedPageImages: {
              ...state.uploadedPageImages,
              [pageNum]: [...currentImages, image],
            },
          };
        }),
      removeUploadedPageImage: (pageNum, index) =>
        set((state) => {
          const currentImages = state.uploadedPageImages[pageNum] || [];
          const newImages = [...currentImages];
          newImages.splice(index, 1);
          return {
            uploadedPageImages: {
              ...state.uploadedPageImages,
              [pageNum]: newImages,
            },
          };
        }),
      addConvertedPageImage: (pageNum, image) =>
        set((state) => {
          const currentImages = state.convertedPageImages[pageNum] || [];
          return {
            convertedPageImages: {
              ...state.convertedPageImages,
              [pageNum]: [...currentImages, image],
            },
          };
        }),
      removeConvertedPageImage: (pageNum, index) =>
        set((state) => {
          const currentImages = state.convertedPageImages[pageNum] || [];
          const newImages = [...currentImages];
          newImages.splice(index, 1);
          return {
            convertedPageImages: {
              ...state.convertedPageImages,
              [pageNum]: newImages,
            },
          };
        }),

      incrementCoverGeneration: () =>
        set((state) => ({
          generationCounts: {
            ...state.generationCounts,
            cover: state.generationCounts.cover + 1,
            lastGenerationDate: new Date().toISOString().split("T")[0],
          },
        })),
      incrementPageGeneration: (pageNum) =>
        set((state) => ({
          generationCounts: {
            ...state.generationCounts,
            pages: {
              ...state.generationCounts.pages,
              [pageNum]: (state.generationCounts.pages[pageNum] || 0) + 1,
            },
            lastGenerationDate: new Date().toISOString().split("T")[0],
          },
        })),
      canGenerateCover: () => {
        const state = get();
        const limit = state.hasPaid
          ? GENERATION_LIMITS.MAX_COVER_PAID
          : GENERATION_LIMITS.MAX_COVER;
        return state.generationCounts.cover < limit;
      },
      canGeneratePage: (pageNum) => {
        const state = get();
        if (!state.hasPaid) return false;
        return (
          (state.generationCounts.pages[pageNum] || 0) <
          GENERATION_LIMITS.MAX_PER_PAGE
        );
      },
      getPageGenerationCount: (pageNum) => {
        const state = get();
        return state.generationCounts.pages[pageNum] || 0;
      },

      setDedicationText: (dedicationText) => set({ dedicationText }),
      setHasPaid: (hasPaid) =>
        set((state) =>
          hasPaid
            ? {
                hasPaid,
                generationCounts: {
                  ...state.generationCounts,
                  cover: 0,
                },
              }
            : { hasPaid },
        ),
      setOrderId: (orderId) => set({ orderId }),
      setStripeSessionId: (stripeSessionId) => set({ stripeSessionId }),
      setPendingPageCount: (pendingPageCount) => set({ pendingPageCount }),
      setPendingCheckoutIntent: (pendingCheckoutIntent) =>
        set({ pendingCheckoutIntent }),
      setPendingResumeStep: (pendingResumeStep) => set({ pendingResumeStep }),
      setBookType: (bookType) => set({ bookType }),
      normalizeStep: () =>
        set((state) => ({
          step: resolveAccessibleStep(state, state.step),
        })),
      resetBook: () =>
        set((state) => ({
          ...initialState,
          isHydrated: state.isHydrated,
        })),
    }),
    {
      name: "hinklecreek-book-storage",
      storage: createJSONStorage(() => indexedDbStorage),
      partialize: (state) => {
        return Object.fromEntries(
          Object.entries(state).filter(([key]) => key !== "isHydrated"),
        ) as typeof state;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
