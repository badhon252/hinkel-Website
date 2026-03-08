"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Coupon,
  CreateCouponDTO,
  UpdateCouponDTO,
} from "@/features/dashboard/types/coupon.types";
import { useCoupon } from "@/features/dashboard/hooks/useCoupon";
import { Loader2 } from "lucide-react";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  onSuccess?: () => void;
}

export function CouponModal({
  isOpen,
  onClose,
  coupon,
  onSuccess,
}: CouponModalProps) {
  const { createCoupon, updateCoupon, isMutating } = useCoupon(undefined, {
    skipFetch: true,
  });
  const { register, handleSubmit, reset, setValue, control } =
    useForm<CreateCouponDTO>({
      defaultValues: {
        codeName: "",
        expiryDate: "",
        usesLimit: 1,
        discountType: "percentage",
        discountAmount: 0,
      },
    });

  const discountType = useWatch({ control, name: "discountType" });

  useEffect(() => {
    if (coupon) {
      setValue("codeName", coupon.codeName);
      setValue("expiryDate", coupon.expiryDate.split("T")[0]);
      setValue("usesLimit", coupon.usesLimit);
      setValue("discountType", coupon.discountType);
      setValue("discountAmount", coupon.discountAmount);
    } else {
      reset({
        codeName: "",
        expiryDate: "",
        usesLimit: 1,
        discountType: "percentage",
        discountAmount: 0,
      });
    }
  }, [coupon, setValue, reset, isOpen]);

  const onSubmit = async (data: CreateCouponDTO) => {
    let success = false;
    if (coupon) {
      success = await updateCoupon(
        coupon._id,
        data as UpdateCouponDTO,
        onSuccess,
      );
    } else {
      success = await createCoupon(data, onSuccess);
    }

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit Coupon" : "Add New Coupon"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="codeName">Coupon Code</Label>
            <Input
              id="codeName"
              placeholder="e.g. SAVE20"
              {...register("codeName", { required: true })}
              className="uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select
                onValueChange={(value: "percentage" | "flat") =>
                  setValue("discountType", value)
                }
                defaultValue={coupon?.discountType || "percentage"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="flat">Flat Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountAmount">
                Value {discountType === "percentage" ? "(%)" : "($)"}
              </Label>
              <Input
                id="discountAmount"
                type="number"
                {...register("discountAmount", {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usesLimit">Uses Limit</Label>
              <Input
                id="usesLimit"
                type="number"
                {...register("usesLimit", {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                {...register("expiryDate", { required: true })}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#ff7a00] hover:bg-[#ff7a00]/90"
              disabled={isMutating}
            >
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {coupon ? "Update Coupon" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
