"use client";

import React, { useState } from "react";
import {
  Trash2,
  Edit,
  Calendar,
  Search,
  Ticket,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCoupon } from "@/features/dashboard/hooks/useCoupon";
import { Coupon } from "@/features/dashboard/types/coupon.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CouponModal } from "@/components/dashboard/pages/manage-coupon/CouponModal";
import { DeleteConfirmationModal } from "@/components/dashboard/pages/manage-coupon/DeleteConfirmationModal";

export function CouponTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { coupons, totalCount, totalPages, loading, refetch, deleteCoupon } =
    useCoupon({ page, limit });

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (couponToDelete) {
      await deleteCoupon(couponToDelete._id, () => {
        setIsDeleteModalOpen(false);
        setCouponToDelete(null);
      });
    }
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.codeName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by code..."
            className="pl-10 h-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-[#ff7a00]/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleAddNew}
            className="bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white gap-2 h-10 px-4 rounded-xl shadow-sm shadow-orange-200 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Coupon</span>
          </Button>
          {/* <div className="text-sm font-medium text-slate-500 whitespace-nowrap">
            Total Coupons: <span className="text-slate-900">{totalCount}</span>
          </div> */}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-12 w-12 bg-slate-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                  <div className="h-3 bg-slate-50 rounded w-1/3" />
                </div>
                <div className="h-8 w-20 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <div className="p-4 rounded-full bg-slate-50">
              <Ticket className="h-8 w-8 opacity-20" />
            </div>
            <p className="text-lg font-bold uppercase tracking-widest opacity-50">
              No Coupons Found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    Code Name
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    Limit / Used
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    Expiry Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCoupons.map((coupon) => (
                  <tr
                    key={coupon._id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#ff7a00]">
                          <Ticket className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-slate-900 uppercase">
                          {coupon.codeName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountAmount}%`
                          : `$${coupon.discountAmount}`}{" "}
                        OFF
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span>Usage</span>
                          <span
                            className={
                              coupon.usedCount >= coupon.usesLimit
                                ? "text-red-500"
                                : "text-slate-600"
                            }
                          >
                            {coupon.usedCount} / {coupon.usesLimit}
                          </span>
                        </div>
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              coupon.usedCount >= coupon.usesLimit
                                ? "bg-red-500"
                                : "bg-[#ff7a00]",
                            )}
                            style={{
                              width: `${Math.min(100, (coupon.usedCount / coupon.usesLimit) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(coupon.expiryDate))}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(coupon)}
                          className="h-9 w-9 rounded-lg text-slate-400 hover:text-[#ff7a00] hover:bg-orange-50 transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(coupon)}
                          className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-10 w-10 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                onClick={() => setPage(i + 1)}
                className={`h-10 w-10 rounded-xl font-bold ${
                  page === i + 1
                    ? "bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white"
                    : ""
                }`}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-10 w-10 rounded-xl"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Modals */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coupon={selectedCoupon}
        onSuccess={refetch}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        couponCode={couponToDelete?.codeName || ""}
      />
    </div>
  );
}
