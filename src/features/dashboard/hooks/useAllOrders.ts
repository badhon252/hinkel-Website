import { useCallback, useEffect, useState } from "react";
import { getAllOrders } from "../api/allOrders.api";

export interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    profileImage: string;
  } | null;
  deliveryType: string;
  pageCount: number;
  totalAmount: number;
  status: string;
  deliveryStatus: string;
  stripeSessionId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  approvalStatus?: string;
  book?: string;
  title?: string;
  refundStatus?: string;
  stripePaymentIntentId?: string;
  isActive?: boolean;
}

export function useAllOrders(
  params: Record<string, string | number | undefined> = { page: 1, limit: 10 },
) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllOrders(params);
      setOrders(res.data); // API shape: { success, count, data, totalCount, totalPages }
      setTotalCount(res.totalCount || res.count || 0);
      setTotalPages(res.totalPages || 0);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    totalCount,
    totalPages,
    loading,
    error,
    refetch: fetchOrders,
  };
}
