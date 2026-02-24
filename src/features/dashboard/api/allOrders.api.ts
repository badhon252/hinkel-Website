import { api } from "@/lib/api";

export async function getAllOrders(
  params: Record<string, string | number | undefined>,
) {
  try {
    const res = await api.get(`order/admin/all-orders`, { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
}

export async function exportOrders(
  params: Record<string, string | number | undefined>,
) {
  try {
    const res = await api.get(`order/admin/export-orders`, {
      params,
      responseType: "blob",
    });
    return res.data;
  } catch (error) {
    console.error("Error exporting orders:", error);
    throw error;
  }
}

export async function toggleOrderArchive(orderId: string, isActive: boolean) {
  try {
    const res = await api.patch(`order/admin/archive/${orderId}`, {
      isActive,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating order archive status:", error);
    throw error;
  }
}
