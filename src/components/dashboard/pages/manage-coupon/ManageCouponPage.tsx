"use client";

import React from "react";
import { Ticket } from "lucide-react";
import { CouponTable } from "./CouponTable";

const ManageCouponPage = () => {
  return (
    <section className="min-h-screen bg-slate-50 relative overflow-hidden py-10 selection:bg-[#ff7a00]/30 selection:text-[#ff7a00]">
      <div className="container mx-auto px-6 space-y-12 relative z-10">
        {/* Global Command Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-8 rounded-4xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-slate-50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-[#ff7a00] shadow-[0_0_10px_#ff7a00] animate-pulse"></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Promotional Control
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">
              Manage{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#ff7a00] to-orange-400">
                Coupons
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white shadow-sm">
                <Ticket className="h-6 w-6 text-[#ff7a00]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Coupon
                </p>
                <p className="text-xl font-black text-slate-900">Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CouponTable />
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-orange-100/20 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-slate-200/30 blur-[100px] rounded-full -z-10" />
    </section>
  );
};

export default ManageCouponPage;
