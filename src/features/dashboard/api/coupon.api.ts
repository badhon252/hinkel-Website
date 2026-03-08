import { api } from "@/lib/api";
import {
  CreateCouponDTO,
  UpdateCouponDTO,
  CouponResponse,
  SingleCouponResponse,
} from "../types/coupon.types";

export async function getAllCoupons(
  params: Record<string, string | number | undefined>,
) {
  try {
    const res = await api.get<CouponResponse>("coupon/all", { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  }
}

export async function createCoupon(data: CreateCouponDTO) {
  try {
    const res = await api.post<SingleCouponResponse>("coupon/create", data);
    return res.data;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
}

export async function updateCoupon(couponId: string, data: UpdateCouponDTO) {
  try {
    const res = await api.put<SingleCouponResponse>(
      `coupon/update/${couponId}`,
      data,
    );
    return res.data;
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw error;
  }
}

export async function deleteCoupon(couponId: string) {
  try {
    const res = await api.delete<SingleCouponResponse>(
      `coupon/delete/${couponId}`,
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function validateCoupon(codeName: string) {
  try {
    const res = await api.get<SingleCouponResponse>("coupon/validate/check", {
      params: { codeName },
    });
    return res.data;
  } catch (error) {
    console.error("Error validating coupon:", error);
    throw error;
  }
}
