import { useCallback, useEffect, useState } from "react";
import {
  getAllCoupons,
  createCoupon as createCouponApi,
  updateCoupon as updateCouponApi,
  deleteCoupon as deleteCouponApi,
} from "../api/coupon.api";
import {
  Coupon,
  CreateCouponDTO,
  UpdateCouponDTO,
} from "../types/coupon.types";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useCoupon(
  params: Record<string, string | number | undefined> = { page: 1, limit: 10 },
  options: { skipFetch?: boolean } = {},
) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [isMutating, setIsMutating] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllCoupons(params);
      setCoupons(res.data);
      setTotalCount(res.totalCount || res.count || 0);
      setTotalPages(res.totalPages || 0);
      setError(null);
    } catch (err) {
      setError(err);
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  const createCoupon = async (
    data: CreateCouponDTO,
    onSuccess?: () => void,
  ) => {
    try {
      setIsMutating(true);
      const res = await createCouponApi(data);
      if (res.success) {
        toast.success(res.message || "Coupon created successfully");
        if (onSuccess) onSuccess();
        else fetchCoupons();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to create coupon",
      );
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const updateCoupon = async (
    couponId: string,
    data: UpdateCouponDTO,
    onSuccess?: () => void,
  ) => {
    try {
      setIsMutating(true);
      const res = await updateCouponApi(couponId, data);
      if (res.success) {
        toast.success(res.message || "Coupon updated successfully");
        if (onSuccess) onSuccess();
        else fetchCoupons();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to update coupon",
      );
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteCoupon = async (couponId: string, onSuccess?: () => void) => {
    try {
      setIsMutating(true);
      const res = await deleteCouponApi(couponId);
      if (res.success) {
        toast.success(res.message || "Coupon deleted successfully");
        if (onSuccess) onSuccess();
        else fetchCoupons();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to delete coupon",
      );
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  useEffect(() => {
    if (!options.skipFetch) {
      fetchCoupons();
    }
  }, [fetchCoupons, options.skipFetch]);

  return {
    coupons,
    totalCount,
    totalPages,
    loading,
    error,
    isMutating,
    refetch: fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  };
}
