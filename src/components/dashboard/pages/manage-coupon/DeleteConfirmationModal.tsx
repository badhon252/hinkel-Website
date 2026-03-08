"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  couponCode: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  couponCode,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Coupon?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the coupon{" "}
            <span className="font-bold text-slate-900 uppercase">
              {couponCode}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete Coupon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
