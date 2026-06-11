"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ArrowUpFromLine,
  Loader2,
  Sparkles,
  Info,
  ImageIcon,
  ZoomIn,
  RotateCcw,
  Camera,
  Palette,
  BookOpen,
  X,
  AlertCircle,
  FileImage,
} from "lucide-react";
import { useBookStore } from "@/features/book-creation/store/book-store";
import { useGeneratePreview } from "@/features/book-creation/hooks/useGeneratePreview";
import { useSession } from "next-auth/react";
import StepIndicator from "@/components/step-indicator";
import ImagePreviewModal from "./image-preview-modal";
import Image from "next/image";
import { BookStore } from "../types";
import { toast } from "sonner";
import { useContent } from "@/features/category-page/hooks/use-content";
import { getCategoryPromptForType } from "../utils/prompt";
import { motion, AnimatePresence } from "framer-motion";
import CoverPageTestSkeleton from "./CoverPageTestSkeleton";
import { BookStep, GENERATION_LIMITS } from "../types";

// ─── Constants ─────────────────────────────────────────────────────────────────

const STEPS = ["Setup & Pay", "Cover", "Dedication", "Pages", "Review"];
const MAX_FILE_MB = 10;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
/** Resize the longer edge to this before sending to the API */
const MAX_CANVAS_PX = 2048;

const ACCEPTED_MIME: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/jpg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/heic": "HEIC",
  "image/heif": "HEIF",
  "image/gif": "GIF",
  "image/bmp": "BMP",
  "image/tiff": "TIFF",
};

const HOW_IT_WORKS = [
  { icon: Camera, label: "Upload a photo", desc: "Any size or format" },
  { icon: Palette, label: "AI sketches it", desc: "Hand-drawn style art" },
  { icon: BookOpen, label: "Pick your cover", desc: "Select the one you love" },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ImageMeta {
  width: number;
  height: number;
}

type AspectClass = "portrait" | "landscape" | "square";

// ─── Pure helpers ──────────────────────────────────────────────────────────────

function getAspect(w: number, h: number): AspectClass {
  const r = w / h;
  if (r < 0.85) return "portrait";
  if (r > 1.15) return "landscape";
  return "square";
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof globalThis.Error ? error.message : fallback;
}

/** Read the ftyp box to detect HEIC without relying on MIME type */
async function sniffHeic(file: File): Promise<boolean> {
  try {
    const buf = await file.slice(0, 12).arrayBuffer();
    const arr = new Uint8Array(buf);
    const ftyp = String.fromCharCode(arr[4], arr[5], arr[6], arr[7]);
    const brand = String.fromCharCode(arr[8], arr[9], arr[10], arr[11]);
    return ftyp === "ftyp" && /^(heic|heix|hevc|hevx|mif1|msf1)/i.test(brand);
  } catch {
    return false;
  }
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new globalThis.Error("Could not decode image"));
    img.src = src;
  });
}

/**
 * Full client-side image pipeline:
 *  1. Validate MIME + size
 *  2. Decode (HEIC polyfill if needed)
 *  3. Resize to ≤ MAX_CANVAS_PX on the long edge (high-quality)
 *  4. Encode to WebP (or JPEG fallback) at 88 % quality
 *  5. Return dataUrl + natural dims
 */
async function processImage(
  file: File,
): Promise<{ dataUrl: string; width: number; height: number }> {
  // 1. Size ──────────────────────────────────────────────────────────
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(
      `File too large — ${(file.size / 1024 / 1024).toFixed(1)} MB. ` +
        `Maximum allowed is ${MAX_FILE_MB} MB.`,
    );
  }

  // 2. Type ──────────────────────────────────────────────────────────
  const isHeic = await sniffHeic(file);
  const mime = file.type || "image/jpeg";
  const isKnown = Boolean(ACCEPTED_MIME[mime]);

  if (!isHeic && !isKnown && !mime.startsWith("image/")) {
    throw new Error(
      `Unsupported file format. ` +
        `Please upload a JPG, PNG, WebP, HEIC, GIF, BMP, or TIFF.`,
    );
  }

  // 3. Decode ────────────────────────────────────────────────────────
  let objectUrl: string;

  if (isHeic) {
    try {
      const heic2anyModule = await import("heic2any");
      const heic2any = heic2anyModule.default as (options: {
        blob: Blob;
        toType: string;
        quality: number;
      }) => Promise<Blob>;
      const result = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.92,
      });
      const blob = Array.isArray(result) ? result[0] : result;
      objectUrl = URL.createObjectURL(blob);
    } catch {
      throw new Error("Could not decode HEIC. Try converting it to JPG first.");
    }
  } else {
    objectUrl = URL.createObjectURL(file);
  }

  let img: HTMLImageElement;
  try {
    img = await loadImg(objectUrl);
  } catch {
    URL.revokeObjectURL(objectUrl);
    throw new Error("Could not read the image — the file may be corrupted.");
  }
  URL.revokeObjectURL(objectUrl);

  const { naturalWidth: sw, naturalHeight: sh } = img;

  // 4. Resize ────────────────────────────────────────────────────────
  const scale = Math.min(1, MAX_CANVAS_PX / Math.max(sw, sh));
  const dw = Math.round(sw * scale);
  const dh = Math.round(sh * scale);

  const canvas = document.createElement("canvas");
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, dw, dh);

  // 5. Encode ────────────────────────────────────────────────────────
  const supportsWebp = canvas
    .toDataURL("image/webp")
    .startsWith("data:image/webp");
  const dataUrl = canvas.toDataURL(
    supportsWebp ? "image/webp" : "image/jpeg",
    0.88,
  );

  return { dataUrl, width: dw, height: dh };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** 3-D book mockup — adapts its dimensions to the image aspect ratio */
function BookMockup({
  src,
  title,
  meta,
}: {
  src: string | null;
  title: string;
  meta?: ImageMeta;
}) {
  const aspect = meta ? getAspect(meta.width, meta.height) : "portrait";

  // Adapt book width/height so landscape images still look natural
  const [bw, bh] =
    aspect === "landscape"
      ? [260, 195]
      : aspect === "square"
        ? [220, 220]
        : [200, 280];

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div style={{ perspective: "900px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={src ?? "empty"}
            initial={{ opacity: 0, rotateY: -18, scale: 0.92 }}
            animate={{ opacity: 1, rotateY: -4, scale: 1 }}
            exit={{ opacity: 0, rotateY: 12, scale: 0.92 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
            style={{
              transformStyle: "preserve-3d",
              width: bw,
              height: bh,
              boxShadow: src
                ? "8px 14px 40px rgba(0,0,0,0.18), 2px 2px 8px rgba(0,0,0,0.07)"
                : "none",
            }}
            className="rounded-r-xl overflow-hidden relative flex-shrink-0"
          >
            {/* Spine */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/25 to-transparent z-10 pointer-events-none" />
            {/* Gloss */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 z-10 pointer-events-none" />

            {src ? (
              <Image
                src={src}
                alt="Selected cover"
                fill
                sizes="260px"
                className="object-cover object-center"
                priority
              />
            ) : (
              <div className="w-full h-full bg-stone-50 border border-stone-100 rounded-r-xl flex flex-col items-center justify-center gap-3">
                <Sparkles className="w-9 h-9 text-stone-200" />
                <p className="text-[11px] text-stone-300 font-medium text-center px-4 leading-relaxed">
                  Your cover
                  <br />
                  will appear here
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Shadow */}
      {src && (
        <div className="w-[60%] h-4 bg-black/10 blur-xl rounded-full -mt-4" />
      )}

      <div className="text-center px-2">
        <p
          className="text-[15px] font-semibold text-stone-800 leading-snug"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {title || "Your Book Title"}
        </p>
        {meta && (
          <p className="text-[11px] text-stone-400 mt-1">
            {aspect === "landscape" && "⚠ Landscape — will be cropped to fit"}
            {aspect === "square" && "Square photo — minimal cropping"}
            {aspect === "portrait" && "Portrait photo — ideal fit"}
          </p>
        )}
      </div>
    </div>
  );
}

/** One sketch card — aspect adapts to the image's natural shape */
function SketchCard({
  src,
  index,
  isSelected,
  meta,
  onSelect,
  onZoom,
}: {
  src: string;
  index: number;
  isSelected: boolean;
  meta?: ImageMeta;
  onSelect: () => void;
  onZoom: () => void;
}) {
  const aspect = meta ? getAspect(meta.width, meta.height) : "portrait";
  const ratioClass =
    aspect === "landscape"
      ? "aspect-[4/3]"
      : aspect === "square"
        ? "aspect-square"
        : "aspect-[3/4]";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
      className="group flex flex-col gap-1.5"
    >
      <div
        className={`
          relative w-full ${ratioClass} rounded-2xl overflow-hidden border-2 transition-all duration-200
          ${
            isSelected
              ? "border-amber-500 ring-4 ring-amber-500/15 shadow-md shadow-amber-500/10"
              : "border-stone-100 hover:border-amber-300 hover:shadow-sm"
          }
        `}
      >
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Select sketch ${index + 1}`}
          className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        />
        <Image
          src={src}
          alt={`Sketch ${index + 1}`}
          fill
          sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 200px"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />

        {/* Hover dim */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/12 transition-colors" />

        {/* Zoom btn */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onZoom();
          }}
          aria-label="Zoom in"
          className="
            absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-white/85 backdrop-blur-sm shadow
            opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity
          "
        >
          <ZoomIn className="w-3.5 h-3.5 text-stone-700" />
        </button>

        {/* Selected check */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-2 left-2 bg-amber-500 rounded-full p-1 shadow"
            >
              <CheckCircle2 className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p
        className={`text-center text-[11px] font-medium transition-colors ${
          isSelected ? "text-amber-600" : "text-stone-400"
        }`}
      >
        {isSelected ? "✓ Selected" : `Sketch ${index + 1}`}
      </p>
    </motion.div>
  );
}

/** Full-screen zoom overlay — correct aspect ratio, ESC to close */
function ZoomOverlay({
  src,
  meta,
  onClose,
}: {
  src: string;
  meta?: ImageMeta;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const ar = meta ? meta.width / meta.height : 3 / 4;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/88 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <motion.div
        initial={{ scale: 0.82, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.82, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative rounded-2xl overflow-hidden shadow-2xl cursor-default"
        style={{
          // Contain within viewport while preserving exact aspect ratio
          aspectRatio: `${ar}`,
          maxWidth: ar >= 1 ? "min(90vw, 900px)" : "min(70vw, 500px)",
          maxHeight: "90vh",
          width: "100%",
        }}
      >
        <Image
          src={src}
          alt="Full preview"
          fill
          sizes="90vw"
          className="object-contain"
          priority
        />
      </motion.div>

      {meta && (
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono">
          {meta.width} × {meta.height}
        </p>
      )}
    </motion.div>
  );
}

/** Drop + click upload zone with real-time drag feedback */
function UploadZone({
  onFile,
  loading,
  disabled,
  hasVariants,
}: {
  onFile: (f: File) => void;
  loading: boolean;
  disabled: boolean;
  hasVariants: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [dragBad, setDragBad] = useState(false);

  const pick = (files: FileList | null) => {
    if (!files?.length || disabled) return;
    onFile(files[0]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };
  const onDragLeave = () => {
    setDragging(false);
    setDragBad(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (
      file &&
      !file.type.startsWith("image/") &&
      !file.name.match(/\.(heic|heif|tiff?|bmp)$/i)
    ) {
      setDragBad(true);
      setTimeout(() => setDragBad(false), 2000);
      return;
    }
    if (file) onFile(file);
  };

  return (
    <label
      className={`block ${disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
    >
      <input
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
      <motion.div
        whileHover={disabled ? {} : { scale: 1.008 }}
        whileTap={disabled ? {} : { scale: 0.995 }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative w-full rounded-2xl border-2 border-dashed transition-all duration-200
          flex flex-col items-center justify-center gap-3 px-6 text-center
          min-h-[160px] sm:min-h-[200px] py-10 sm:py-14
          ${
            dragBad
              ? "border-red-400 bg-red-50"
              : dragging
                ? "border-amber-400 bg-amber-50 scale-[1.01]"
                : disabled
                  ? "border-stone-200 bg-stone-50"
                  : "border-amber-300 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-400"
          }
        `}
      >
        {loading ? (
          <>
            <Loader2 className="w-9 h-9 text-amber-500 animate-spin" />
            <div>
              <p className="text-sm font-semibold text-amber-700">
                Creating your sketch…
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Usually 15 – 30 seconds
              </p>
            </div>
            {/* Animated progress track */}
            <div className="w-40 h-1 rounded-full bg-amber-100 overflow-hidden">
              <motion.div
                className="h-full bg-amber-400 rounded-full"
                initial={{ width: "5%" }}
                animate={{ width: "80%" }}
                transition={{ duration: 25, ease: "easeOut" }}
              />
            </div>
          </>
        ) : dragBad ? (
          <>
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm font-semibold text-red-600">
              Not an image file
            </p>
          </>
        ) : dragging ? (
          <>
            <FileImage className="w-10 h-10 text-amber-500" />
            <p className="text-sm font-semibold text-amber-700">
              Drop to upload
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center">
              <ArrowUpFromLine className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-700">
                {hasVariants ? "Upload another photo" : "Upload your photo"}
              </p>
              <p className="text-xs text-stone-400 mt-0.5 hidden sm:block">
                Drag & drop, or click to browse
              </p>
              <p className="text-xs text-stone-400 mt-0.5 sm:hidden">
                Tap to browse
              </p>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              JPG · PNG · WebP · HEIC · GIF · BMP · TIFF &nbsp;·&nbsp; Max{" "}
              {MAX_FILE_MB} MB
            </p>
          </>
        )}
      </motion.div>
    </label>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function CoverPageTestPage() {
  const isHydrated = useBookStore((s: BookStore) => s.isHydrated);
  const setStep = useBookStore((s: BookStore) => s.setStep);
  const setCoverImage = useBookStore((s: BookStore) => s.setCoverImage);
  const setCoverImageVariants = useBookStore(
    (s: BookStore) => s.setCoverImageVariants,
  );
  const setSelectedCoverVariant = useBookStore(
    (s: BookStore) => s.setSelectedCoverVariant,
  );
  const incrementCoverGeneration = useBookStore(
    (s: BookStore) => s.incrementCoverGeneration,
  );
  const canGenerateCover = useBookStore((s: BookStore) => s.canGenerateCover);

  const {
    coverImageVariants,
    selectedCoverVariantIndex,
    bookType,
    hasPaid,
    bookTitle,
  } = useBookStore();

  const { data: session } = useSession();
  const isAdmin = session?.user?.role?.toLowerCase() === "admin";
  const { data: contentData } = useContent({ limit: 12 });
  const categories = contentData?.data || [];
  const selectedStylePrompt = getCategoryPromptForType(categories, bookType);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [variantMeta, setVariantMeta] = useState<ImageMeta[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  // Keep pending meta in a ref so the modal confirm can access it
  const pendingMetaRef = useRef<ImageMeta | null>(null);

  const {
    generatePreview,
    loading: generating,
    error,
    reset,
  } = useGeneratePreview();

  const selectedVariant =
    selectedCoverVariantIndex !== null
      ? coverImageVariants[selectedCoverVariantIndex]
      : (coverImageVariants[0] ?? null);

  const selectedMeta =
    selectedCoverVariantIndex !== null
      ? variantMeta[selectedCoverVariantIndex]
      : variantMeta[0];

  useEffect(() => {
    if (!coverImageVariants.length) {
      return;
    }

    if (
      selectedCoverVariantIndex === null ||
      selectedCoverVariantIndex >= coverImageVariants.length
    ) {
      setSelectedCoverVariant(0);
    }
  }, [
    coverImageVariants.length,
    selectedCoverVariantIndex,
    setSelectedCoverVariant,
  ]);

  const canGenerate = isAdmin || canGenerateCover();
  const hasVariants = coverImageVariants.length > 0;
  const loading = processing || generating;
  const coverGenerationsUsed = useBookStore(
    (s: BookStore) => s.generationCounts.cover,
  );
  const coverTriesLeft = Math.max(
    0,
    GENERATION_LIMITS.MAX_COVER_PAID - coverGenerationsUsed,
  );

  // ── File handler ──────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setUploadError(null);
    setProcessing(true);
    try {
      const { dataUrl, width, height } = await processImage(file);
      pendingMetaRef.current = { width, height };
      setPendingImage(dataUrl);
      setIsModalOpen(true);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to process image.");
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingImage(null);
    pendingMetaRef.current = null;
    reset();
  };

  const handleConfirmGeneration = async () => {
    if (!pendingImage) return;
    if (!isAdmin && !canGenerateCover()) {
      toast.error(
        `You have already used your ${GENERATION_LIMITS.MAX_COVER_PAID} cover tries. Please choose your favorite cover option to continue.`,
      );
      setIsModalOpen(false);
      return;
    }
    const result = await generatePreview(
      pendingImage,
      bookType,
      selectedStylePrompt,
    );
    if (result) {
      incrementCoverGeneration();
      const meta = pendingMetaRef.current ?? { width: 800, height: 1067 };
      const newVariants = [...coverImageVariants, result];
      const newMeta = [...variantMeta, meta];
      setCoverImage(pendingImage);
      setCoverImageVariants(newVariants);
      setVariantMeta(newMeta);
      setSelectedCoverVariant(newVariants.length - 1);
      toast.success(
        isAdmin
          ? "👑 New cover sketch generated."
          : `Cover option ${newVariants.length} of ${GENERATION_LIMITS.MAX_COVER_PAID} is ready. You can compare them and choose your favorite.`,
      );
      setIsModalOpen(false);
      setPendingImage(null);
      pendingMetaRef.current = null;
    }
  };

  const handleStepClick = (index: number) => {
    const map: Partial<Record<number, BookStep>> = {
      0: "setup",
      2: "dedication",
      3: "pages",
      4: "review",
    };
    if (map[index]) setStep(map[index]);
  };

  const navVariant = (dir: 1 | -1) => {
    const cur = selectedCoverVariantIndex ?? 0;
    const next = Math.max(
      0,
      Math.min(coverImageVariants.length - 1, cur + dir),
    );
    setSelectedCoverVariant(next);
  };

  if (!isHydrated) return <CoverPageTestSkeleton />;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Zoom overlay */}
      <AnimatePresence>
        {zoomedIndex !== null && coverImageVariants[zoomedIndex] && (
          <ZoomOverlay
            src={coverImageVariants[zoomedIndex]}
            meta={variantMeta[zoomedIndex]}
            onClose={() => setZoomedIndex(null)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col bg-[linear-gradient(180deg,#fdf8f1_0%,#fffdfa_35%,#ffffff_100%)]">
        <StepIndicator
          steps={STEPS}
          currentStep={1}
          onStepClick={handleStepClick}
        />

        {/* Page shell */}
        <div className="mx-auto flex-1 w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-8 lg:px-10 xl:px-16">
          {/* Header */}
          <div className="mb-7 flex items-start gap-3 sm:mb-10">
            <button
              onClick={() => setStep("setup")}
              aria-label="Go back"
              className="-ml-2 mt-1 flex-shrink-0 rounded-xl p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-amber-700">
                Cover creation
              </span>
              <h1
                className="mt-3 text-2xl font-bold leading-tight text-stone-800 sm:text-3xl md:text-4xl"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
              >
                Design Your Cover
              </h1>
              <p className="mt-2 text-sm leading-7 text-stone-500 sm:text-base">
                Upload a photo, compare up to {GENERATION_LIMITS.MAX_COVER_PAID}{" "}
                converted images, and pick the one you like best.
              </p>
            </div>
          </div>

          {/*
            Layout:
            · Mobile / tablet  → single column, actions first
            · Desktop (xl+)    → two-column, preview sticky on right
          */}
          <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,420px)] xl:items-start xl:gap-8">
            {/* ═══ LEFT / MAIN ═══ */}
            <div className="order-1 flex flex-col gap-5 xl:order-1">
              <div className="rounded-3xl border border-amber-100 bg-white/95 p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
                      Cover guidance
                    </p>
                    <h2 className="text-base sm:text-lg font-semibold text-stone-800">
                      You have {GENERATION_LIMITS.MAX_COVER_PAID} chances to
                      find the perfect cover
                    </h2>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      Each uploaded photo creates one cover option. Compare the
                      options, tap the one you love most, then continue to the
                      next step.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
                    <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center">
                      <p className="text-xs font-medium text-amber-700">Used</p>
                      <p className="text-xl font-bold text-amber-900">
                        {coverGenerationsUsed}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
                      <p className="text-xs font-medium text-emerald-700">
                        Left
                      </p>
                      <p className="text-xl font-bold text-emerald-900">
                        {isAdmin ? "∞" : coverTriesLeft}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How it works — hidden once variants exist */}
              <AnimatePresence>
                {!hasVariants && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    className="rounded-3xl border border-stone-100 bg-white/95 p-6 shadow-sm sm:p-8"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-5">
                      How it works
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
                      {HOW_IT_WORKS.map(({ icon: Icon, label, desc }, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50/70 p-4 text-left sm:flex-col sm:items-center sm:bg-transparent sm:p-0 sm:text-center"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-stone-800 leading-tight">
                              {label}
                            </p>
                            <p className="mt-1 text-[11px] leading-relaxed text-stone-400">
                              {desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload zone */}
              {hasPaid && (
                <div className="rounded-3xl border border-stone-100 bg-white/95 p-5 shadow-sm sm:p-7">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-sm sm:text-base font-semibold text-stone-800">
                        {hasVariants
                          ? "Try another cover photo"
                          : "Upload your cover photo"}
                      </h2>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {isAdmin
                          ? "Unlimited admin access"
                          : `${coverTriesLeft} of ${GENERATION_LIMITS.MAX_COVER_PAID} cover tries left`}{" "}
                        · Any image format · Max {MAX_FILE_MB} MB
                      </p>
                    </div>
                    {!canGenerate && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                        Cover tries used
                      </span>
                    )}
                  </div>

                  <UploadZone
                    onFile={handleFile}
                    loading={loading}
                    disabled={!canGenerate || loading}
                    hasVariants={hasVariants}
                  />

                  {/* Upload error banner */}
                  <AnimatePresence>
                    {uploadError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl"
                      >
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="flex-1 text-xs text-red-700 font-medium">
                          {uploadError}
                        </p>
                        <button
                          onClick={() => setUploadError(null)}
                          className="text-red-400 hover:text-red-600 flex-shrink-0"
                          aria-label="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Sketch gallery */}
              {hasVariants && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-stone-100 bg-white/95 p-5 shadow-sm sm:p-7"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-sm sm:text-base font-semibold text-stone-800">
                        Your Sketches
                      </h2>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Tap to select · hold zoom to inspect
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-stone-400 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-full">
                      {coverImageVariants.length} sketch
                      {coverImageVariants.length !== 1 ? "es" : ""}
                    </span>
                  </div>

                  {/*
                    Adaptive grid:
                    2 col → xs phones
                    3 col → sm tablets
                    4 col → lg desktops
                    Each card's aspect-ratio mirrors the actual image shape
                  */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {coverImageVariants.map((v, i) => (
                      <SketchCard
                        key={i}
                        src={v}
                        index={i}
                        isSelected={selectedCoverVariantIndex === i}
                        meta={variantMeta[i]}
                        onSelect={() => setSelectedCoverVariant(i)}
                        onZoom={() => setZoomedIndex(i)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Gate: not paid, no variants */}
              {!hasVariants && !hasPaid && (
                <div className="flex flex-col items-center gap-4 rounded-3xl border border-stone-100 bg-white/95 p-10 text-center shadow-sm sm:p-14">
                  <div className="w-14 h-14 rounded-3xl bg-stone-50 border border-stone-100 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-stone-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-700">
                      Complete payment first
                    </p>
                    <p className="text-xs text-stone-400 mt-1 max-w-[260px] leading-relaxed">
                      Once your order is confirmed you can upload a photo and
                      generate your cover sketch.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    useBookStore.getState().setHasPaid(false);
                    useBookStore.getState().setOrderId(null);
                    setCoverImage(null);
                    setCoverImageVariants([]);
                    setVariantMeta([]);
                    setStep("free-generation");
                  }}
                  variant="outline"
                  className="sm:w-auto rounded-2xl h-12 px-5 text-sm text-stone-600 border-stone-200 hover:bg-stone-50 gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Start over
                </Button>

                <Button
                  onClick={() => setStep("dedication")}
                  disabled={!hasVariants}
                  className="
                    flex-1 bg-[#ff8b36] hover:bg-[#ff7a20] active:bg-[#f06c10]
                    disabled:opacity-40 disabled:grayscale
                    rounded-2xl h-12 text-sm font-semibold text-white
                    shadow-lg shadow-orange-500/20
                    flex items-center justify-center gap-2 transition-all
                  "
                >
                  Next page: Add your book title
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {!hasVariants && hasPaid && (
                <p className="text-center text-xs text-stone-400 -mt-1">
                  Upload a photo above to unlock Continue
                </p>
              )}
            </div>

            {/* ═══ RIGHT / PREVIEW ═══ */}
            <div className="order-2 flex flex-col gap-4 xl:order-2 xl:sticky xl:top-28">
              {/* Book preview card */}
              <div className="rounded-3xl border border-stone-100 bg-white/95 p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
                    Live Preview
                  </span>
                  {selectedVariant && (
                    <button
                      onClick={() =>
                        setZoomedIndex(selectedCoverVariantIndex ?? 0)
                      }
                      className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 transition-colors"
                    >
                      <ZoomIn className="w-3.5 h-3.5" /> Zoom
                    </button>
                  )}
                </div>

                <div className="flex justify-center">
                  <BookMockup
                    src={selectedVariant}
                    title={bookTitle}
                    meta={selectedMeta}
                  />
                </div>

                {/* Variant nav — only when multiple */}
                {coverImageVariants.length > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                      onClick={() => navVariant(-1)}
                      disabled={(selectedCoverVariantIndex ?? 0) === 0}
                      aria-label="Previous"
                      className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-800 disabled:opacity-30 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-stone-400 tabular-nums w-16 text-center">
                      {(selectedCoverVariantIndex ?? 0) + 1} /{" "}
                      {coverImageVariants.length}
                    </span>
                    <button
                      onClick={() => navVariant(1)}
                      disabled={
                        (selectedCoverVariantIndex ?? 0) ===
                        coverImageVariants.length - 1
                      }
                      aria-label="Next"
                      className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-800 disabled:opacity-30 transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* About sketches */}
              <div className="flex gap-3.5 rounded-2xl border border-amber-100 bg-amber-50 p-5">
                <div className="mt-0.5 p-1.5 bg-amber-100 rounded-lg h-fit flex-shrink-0">
                  <Info className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">
                    The sktchLABS Process
                  </p>
                  <p className="text-xs text-amber-700/80 leading-relaxed">
                    Our platform transforms your favorite photos into timeless,
                    hand-drawn artwork. By balancing clean lines with artistic
                    depth, we give your memories a warm, hand-crafted feel
                    that&apos;s ready for you to bring to life with color.
                  </p>
                </div>
              </div>

              {/* Photo tips */}
              <div className="rounded-2xl border border-stone-100 bg-white/95 p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4">
                  Photo tips
                </p>
                {[
                  <>
                    <b>Bright is Best:</b>
                    {
                      " Use clear, well-lit photos for the most crisp and detailed outlines."
                    }
                  </>,
                  <>
                    <b>Focus on the Subject:</b>
                    {
                      " Ensure faces and pets are front-and-center and clearly visible."
                    }
                  </>,
                  <>
                    <b>Think Vertically:</b>
                    {
                      " Portrait (vertical) photos naturally fill our book pages most beautifully."
                    }
                  </>,
                  <>
                    <b>Keep it Natural:</b>
                    {
                      " High-quality, unfiltered images produce the cleanest sketches."
                    }
                  </>,
                ].map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 mb-3 last:mb-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImagePreviewModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirmGeneration}
        imagePreview={pendingImage}
        isLoading={generating}
        error={error}
      />
    </>
  );
}
