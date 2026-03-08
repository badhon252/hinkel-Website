// src/features/dashboard/types/coupon.types.ts

export type DiscountType = "percentage" | "flat";

export interface Coupon {
  _id: string;
  codeName: string;
  expiryDate: string; // ISO format
  usesLimit: number;
  discountType: DiscountType;
  discountAmount: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponDTO {
  codeName: string;
  expiryDate: string;
  usesLimit: number;
  discountType: DiscountType;
  discountAmount: number;
}

export interface UpdateCouponDTO {
  codeName?: string;
  expiryDate?: string;
  usesLimit?: number;
  discountType?: DiscountType;
  discountAmount?: number;
}

export interface CouponResponse {
  success: boolean;
  message: string;
  data: Coupon[];
  totalCount?: number;
  totalPages?: number;
  count?: number;
}

export interface SingleCouponResponse {
  success: boolean;
  message: string;
  data: Coupon;
}
