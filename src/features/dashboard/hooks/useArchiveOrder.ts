import { useState } from "react";
import { toggleOrderArchive } from "../api/allOrders.api";
import { toast } from "sonner";

export function useArchiveOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const updateArchiveStatus = async (orderId: string, isActive: boolean) => {
    try {
      setLoading(true);
      setError(null);
      await toggleOrderArchive(orderId, isActive);
      toast.success(
        `Order ${isActive ? "unarchived" : "archived"} successfully`,
      );
      return true;
    } catch (err) {
      console.error(err);
      setError(err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(
        errorObj?.response?.data?.message ||
          "Failed to update order archive status",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateArchiveStatus,
    loading,
    error,
  };
}
