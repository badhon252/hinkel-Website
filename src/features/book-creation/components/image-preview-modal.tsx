"use client";

import Image from "next/image";
import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  imagePreview: string | null;
  isLoading: boolean;
  error: string | null;
}

export default function ImagePreviewModal({
  isOpen,
  onClose,
  onConfirm,
  imagePreview,
  isLoading,
  error,
}: ImagePreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={true}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Generate Sketch Preview</DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Generating your sketch preview..."
              : "Would you like to proceed with this image?"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative w-full aspect-square max-w-[500px] rounded-lg overflow-hidden border border-border">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">
                Processing your image...
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
              <X className="w-4 h-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Proceed"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
