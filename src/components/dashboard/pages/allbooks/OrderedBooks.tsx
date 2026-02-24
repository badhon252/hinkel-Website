"use client";
import { useAllOrders } from "@/features/dashboard/hooks/useAllOrders";
import { exportOrders } from "@/features/dashboard/api/allOrders.api";
import Image from "next/image";
import React from "react";
import {
  Package,
  User,
  Truck,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import OrderedBooksSkeleton from "./OrderedBooksSkeleton";
import { useStatusUpdate } from "@/features/dashboard/hooks/useStatusUpdate";
import { useArchiveOrder } from "@/features/dashboard/hooks/useArchiveOrder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const OrderedBooks = () => {
  const [activeTab, setActiveTab] = React.useState<"active" | "archived">(
    "active",
  );
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [deliveryStatus, setDeliveryStatus] = React.useState("all");
  const [deliveryType, setDeliveryType] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [sortOrder, setSortOrder] = React.useState("desc");
  const [page, setPage] = React.useState(1);
  const limit = 9;

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const params = React.useMemo(
    () => ({
      page,
      limit,
      status,
      deliveryStatus: deliveryStatus,
      deliveryType,
      search: debouncedSearch,
      sortBy,
      sortOrder,
    }),
    [
      page,
      limit,
      status,
      deliveryStatus,
      deliveryType,
      debouncedSearch,
      sortBy,
      sortOrder,
    ],
  );

  const { orders, totalCount, totalPages, loading, error, refetch } =
    useAllOrders(params);

  const { updateStatus, loading: isUpdating } = useStatusUpdate();
  const { updateArchiveStatus, loading: isArchiving } = useArchiveOrder();

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateStatus(orderId, newStatus);
      toast.success("Delivery status synchronized");
      refetch(); // Refresh the list
    } catch {
      toast.error("Failed to update delivery protocol");
    }
  };

  const handleToggleArchive = async (
    orderId: string,
    currentIsActive: boolean,
  ) => {
    const success = await updateArchiveStatus(orderId, !currentIsActive);
    if (success) {
      refetch();
    }
  };

  const handleExport = async () => {
    try {
      toast.promise(exportOrders(params), {
        loading: "Preparing your export...",
        success: (data) => {
          const url = window.URL.createObjectURL(new Blob([data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            `orders-export-${new Date().toISOString().split("T")[0]}.csv`,
          );
          document.body.appendChild(link);
          link.click();
          link.parentNode?.removeChild(link);
          return "Orders exported successfully";
        },
        error: "Failed to export orders",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export orders");
    }
  };

  if (loading && page === 1 && !debouncedSearch)
    return <OrderedBooksSkeleton />;

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500 font-medium">
          Error fetching ordered books. Please try again later.
        </p>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Ordered Books
          </h2>
          <p className="text-gray-500 mt-1">Manage and track all book orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-primary transition-all shadow-lg shadow-gray-200"
          >
            <Download size={18} />
            Export CSV
          </button>
          <div className="bg-orange-50 px-4 py-2 rounded-full border border-orange-100">
            <span className="text-orange-600 font-bold">
              {totalCount} Total Orders
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-2 border-b-2 font-bold text-sm transition-colors ${
            activeTab === "active"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
          }`}
        >
          Active Orders
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`pb-3 px-2 border-b-2 font-bold text-sm transition-colors ${
            activeTab === "archived"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
          }`}
        >
          Archived Orders
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Search by user, email or title..."
              className="pl-10 h-11 border-gray-200 rounded-xl focus:ring-orange-500/20 focus:border-orange-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 border-gray-200 rounded-xl">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delivery Status Filter */}
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-gray-400 shrink-0" />
            <Select
              value={deliveryStatus}
              onValueChange={(val) => {
                setDeliveryStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 border-gray-200 rounded-xl">
                <SelectValue placeholder="Delivery Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Delivery</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-gray-400 shrink-0" />
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(val) => {
                const [field, order] = val.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <SelectTrigger className="h-11 border-gray-200 rounded-xl">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="totalAmount-desc">
                  Price: High to Low
                </SelectItem>
                <SelectItem value="totalAmount-asc">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="pageCount-desc">
                  Pages: Most First
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 flex items-center">
            Type:
          </span>
          {["all", "digital", "print", "print&digital"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setDeliveryType(type);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                deliveryType === type
                  ? "bg-orange-100 text-orange-600 border border-orange-200"
                  : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
              }`}
            >
              {type.replace("&", " & ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
          {[...Array(6)].map((_, i) => (
            <OrderedBooksSkeleton key={i} />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders
              .filter((order) =>
                activeTab === "active"
                  ? order.isActive !== false
                  : order.isActive === false,
              )
              .map((order) => (
                <div
                  key={order._id}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Book Image Section */}
                  <div className="relative w-full h-56 bg-gray-50 overflow-hidden">
                    {order.book ? (
                      <Image
                        src={order.book}
                        alt={order.title || "Book Cover"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Package size={48} strokeWidth={1.5} />
                        <span className="text-xs font-medium">
                          No Image Available
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                          order.status === "paid"
                            ? "bg-green-500 text-white"
                            : order.status === "pending"
                              ? "bg-amber-500 text-white"
                              : order.status === "cancelled"
                                ? "bg-rose-500 text-white"
                                : "bg-slate-400 text-white"
                        }`}
                      >
                        Payment: {order.status}
                      </span>
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                        <Truck size={12} className="text-orange-600" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">
                          {order.deliveryStatus || "pending"}
                        </span>
                      </div>
                      {order.refundStatus && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-rose-100 text-rose-600 border border-rose-200">
                          Refund: {order.refundStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col grow">
                    <div className="mb-4">
                      <h3
                        className="font-bold text-xl text-gray-900 line-clamp-1 mb-1"
                        title={
                          order.title ||
                          `Order #${order._id.slice(-6).toUpperCase()}`
                        }
                      >
                        {order.title ||
                          `Order #${order._id.slice(-6).toUpperCase()}`}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded italic">
                          {order.deliveryType}
                        </span>
                        <span>•</span>
                        <span>{order.pageCount} Pages</span>
                      </div>
                    </div>

                    <div className="space-y-3 mt-auto">
                      {/* User Info */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                          <User size={16} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {order.userId?.name || "Guest User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {order.userId?.email || "No email provided"}
                          </p>
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-gray-400">
                              Total Price
                            </span>
                            <span className="text-lg font-black text-orange-600">
                              ${(order.totalAmount / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">
                              Ordered On
                            </span>
                            <span className="text-xs font-medium text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Status Update Control */}
                        <div className="w-full flex items-center justify-between gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">
                            Update Status
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleToggleArchive(
                                  order._id,
                                  order.isActive !== false,
                                )
                              }
                              disabled={isArchiving}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              {order.isActive === false ? (
                                <>
                                  <ArchiveRestore
                                    size={12}
                                    className="text-orange-600"
                                  />
                                  Unarchive
                                </>
                              ) : (
                                <>
                                  <Archive
                                    size={12}
                                    className="text-orange-600"
                                  />
                                  Archive
                                </>
                              )}
                            </button>
                            {order.book && (
                              <a
                                href={order.book}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                <ExternalLink
                                  size={12}
                                  className="text-orange-600"
                                />
                                View Book
                              </a>
                            )}
                            <Select
                              defaultValue={order.deliveryStatus || "pending"}
                              onValueChange={(value) =>
                                handleStatusChange(order._id, value)
                              }
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="h-8 w-[120px] text-[10px] font-bold uppercase tracking-widest bg-white border-gray-200">
                                <SelectValue placeholder="Set Status" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-gray-200">
                                <SelectItem
                                  value="pending"
                                  className="text-[10px] font-bold uppercase tracking-widest"
                                >
                                  Pending
                                </SelectItem>
                                <SelectItem
                                  value="approved"
                                  className="text-[10px] font-bold uppercase tracking-widest"
                                >
                                  Approved
                                </SelectItem>
                                <SelectItem
                                  value="rejected"
                                  className="text-[10px] font-bold uppercase tracking-widest"
                                >
                                  Rejected
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      page === i + 1
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
          <Package size={64} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No books found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or search query.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setStatus("all");
              setDeliveryStatus("all");
              setDeliveryType("all");
              setPage(1);
            }}
            className="mt-4 text-orange-600 font-bold hover:underline"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderedBooks;
