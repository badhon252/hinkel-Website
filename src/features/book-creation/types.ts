/**
 * Generate Preview API Types
 */

export interface GeneratePreviewRequest {
  image: string; // Base64 encoded image
  type: string;
}

export interface GeneratePreviewResponse {
  previewUrl: string; // Base64 or URL of generated preview
}

/**
 * Update Book API Types
 */
export interface UploadBookRequest {
  title: string;
  image: File | Blob;
  orderId: string;
  approvalStatus?: string;
}

export interface UploadBookResponse {
  success: boolean;
  message: string;
  order?: {
    _id: string;
    userId: string;
    deliveryType: DeliveryType;
    pageCount: number;
    totalAmount: number;
    status: string;
    deliveryStatus: string;
    stripeSessionId: string;
    createdAt: string;
    updatedAt: string;
    book: string; // Cloudinary URL
    title: string;
    approvalStatus: string;
  };
}

export type DeliveryType = "digital" | "print" | "print&digital";

export interface PricingData {
  _id: string;
  deliveryType: DeliveryType;
  currency: string;
  pageTiers: { pageLimit: number; price: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface PricingResponse {
  success: boolean;
  data: PricingData[];
}

export interface calculatePriceRequest {
  pageCount: number;
  deliveryType: DeliveryType;
}

export interface calculatePriceResponse {
  success: boolean;
  data: {
    pageCount: number;
    pricePerPage: number;
    deliveryType: DeliveryType;
    price: number;
    totalPrice: number;
    currency: string;
  };
}

export interface ConfirmPaymentRequest {
  userId: string;
  pageCount: number;
  deliveryType: DeliveryType;
  orderId?: string;
  bookType?: string;
  couponCode?: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  sessionUrl: string;
  orderId: string;
}

/**
 * Book Creation Flow Types
 * Defines all interfaces and types for the book creation process
 */

/**
 * Step names in the book creation workflow
 */
export type BookStep =
  | "landing"
  | "cover"
  | "setup"
  | "format"
  | "images"
  | "finalize"
  | "success";

/**
 * Supported output formats for the book
 */
export type OutputFormat = "pdf" | "printed" | "pdf&printed";

/**
 * Page number to image URL mapping
 */
export type PageImages = Record<number, string>;
export type PageTexts = Record<number, { topLine: string; bottomLine: string }>;

/**
 * Generation counts tracking per page and cover
 */
export interface GenerationCounts {
  cover: number;
  pages: Record<number, number>;
  lastGenerationDate: string | null; // ISO date string (YYYY-MM-DD)
}

/**
 * Complete book configuration and state
 */
export interface BookState {
  // Step tracking
  step: BookStep;
  returnStep: BookStep | null; // For mid-flow preview navigation

  // Book metadata
  bookTitle: string;
  pageCount: number;
  includeDedicationPage: boolean;
  dedicationText: string;

  // Cover and preview
  coverImage: string | null;
  coverImageVariants: string[];
  selectedCoverVariantIndex: number | null;
  bookType: string;

  // Page content
  pageImages: PageImages;
  pageTexts: PageTexts;
  uploadedPageImages: Record<number, string[]>;
  convertedPageImages: Record<number, string[]>;

  // Generation tracking
  generationCounts: GenerationCounts;

  // Order details
  outputFormat: OutputFormat | null;
  hasPaid: boolean;
  orderId: string | null;
  pendingPageCount: number | null;
}

/**
 * All actions for updating book state
 */
export interface BookActions {
  // Navigation
  setStep: (step: BookStep) => void;
  setReturnStep: (step: BookStep | null) => void;

  // Book setup
  setBookTitle: (title: string) => void;
  setPageCount: (count: number) => void;
  setIncludeDedicationPage: (include: boolean) => void;
  setDedicationText: (text: string) => void;

  // Cover management
  setCoverImage: (image: string | null) => void;
  setCoverImageVariants: (variants: string[]) => void;
  setSelectedCoverVariant: (index: number) => void;

  // Page images
  setPageImages: (images: PageImages) => void;
  updatePageImage: (pageNum: number, image: string) => void;
  updatePageText: (
    pageNum: number,
    topLine: string,
    bottomLine: string,
  ) => void;

  // Uploaded images management
  setUploadedPageImages: (uploadedPageImages: Record<number, string[]>) => void;
  addUploadedPageImage: (pageNum: number, image: string) => void;
  removeUploadedPageImage: (pageNum: number, index: number) => void;

  // Converted images management
  addConvertedPageImage: (pageNum: number, image: string) => void;
  removeConvertedPageImage: (pageNum: number, index: number) => void;

  // Generation count tracking
  incrementCoverGeneration: () => void;
  incrementPageGeneration: (pageNum: number) => void;
  canGenerateCover: () => boolean;
  canGeneratePage: (pageNum: number) => boolean;
  getPageGenerationCount: (pageNum: number) => number;

  // Order details
  setOutputFormat: (format: OutputFormat) => void;
  setHasPaid: (paid: boolean) => void;
  setOrderId: (orderId: string | null) => void;
  setPendingPageCount: (count: number | null) => void;
  setBookType: (type: string) => void;

  // Reset state
  resetBook: () => void;
}

/**
 * Combined store type (state + actions)
 */
export type BookStore = BookState & BookActions;

/**
 * File validation constants
 */
export const FILE_VALIDATION = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
} as const;

/**
 * Generation limits constants
 */
export const GENERATION_LIMITS = {
  MAX_PER_PAGE: 3,
  MAX_COVER: 3,
} as const;

/**
 * Page count options
 */
export const PAGE_COUNT_OPTIONS = [10, 20, 30, 40] as const;

/**
 * Output format pricing
 */
export const PRICING = {
  pdf: 24.22,
  printed: 24.22,
  "pdf&printed": 24.22,
} as const;

export interface DeliveryMethodCardProps {
  method: {
    id: OutputFormat;
    apiType: DeliveryType;
    title: string;
    subtitle: string;
  };
  selectedPages: number;
  selectedFormat: OutputFormat;
  onSelect: (id: OutputFormat) => void;
  prices: PricingData[];
}
