"use client";

import React, { useEffect } from "react";
import { useContent } from "@/features/category-page/hooks/use-content";
import {
  useCategoryHeader,
  usePostCategoryHeader,
} from "@/features/category-page/hooks/use-categoryheader";
import { CategoryContent } from "@/features/category-page/types";
import { ShieldCheck, Database, Type, MonitorX, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CategoryCard from "./CategoryCard";
import AddCategory from "../addbooks/AddCategory";
import CategoryHeaderForm from "./CategoryHeaderForm";

export function CategoryShow() {
  const { data: contentData, isLoading, error } = useContent({ limit: 50 });
  const { data: headerData } = useCategoryHeader();
  const { mutate: postHeader, isPending } = usePostCategoryHeader();

  // Resolution Gate Logic
  useEffect(() => {
    const checkResolution = () => {
      if (window.innerWidth < 720) {
        toast.message("Low Resolution Detected", {
          description:
            "For the best administrative experience, please switch to a workstation.",
          icon: <MonitorX className="w-4 h-4 text-amber-500" />,
        });
      }
    };

    checkResolution();
    window.addEventListener("resize", checkResolution);
    return () => window.removeEventListener("resize", checkResolution);
  }, []);

  const categories =
    contentData?.data
      ?.slice()
      .sort((a: CategoryContent, b: CategoryContent) =>
        (a.type || "").localeCompare(b.type || ""),
      ) || [];

  if (error) {
    return (
      <div className="py-16 flex justify-center items-center">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl flex items-center gap-4 backdrop-blur-md">
          <ShieldCheck className="w-6 h-6 animate-pulse" />
          <span className="font-mono tracking-widest uppercase text-xs">
            System Failure: Could not load categories.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
          <Database size={14} className="text-[#ff7a00]" />
          <span className="text-xs font-bold text-slate-600">
            {isLoading ? "..." : categories.length} Categories
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Header Settings Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg border-slate-200 hover:bg-[#ff7a00]/5 hover:text-[#ff7a00] hover:border-[#ff7a00]/30 transition-all"
              >
                <Type size={14} />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white border-slate-100">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Category Header Settings
                </DialogTitle>
                <DialogDescription className="text-slate-500">
                  Configure the public category page header.
                </DialogDescription>
              </DialogHeader>
              <CategoryHeaderForm
                key={headerData?.data?.data ? "loaded" : "loading"}
                initialTitle={headerData?.data?.data?.title || ""}
                initialSubtitle={headerData?.data?.data?.subtitle || ""}
                isPending={isPending}
                onSubmit={(data) => {
                  postHeader(data, {
                    onSuccess: () => toast.success("Header settings updated"),
                    onError: (err) =>
                      toast.error("Update failed: " + err.message),
                  });
                }}
              />
            </DialogContent>
          </Dialog>

          {/* Add Category Button */}
          <AddCategory
            trigger={
              <Button
                size="sm"
                className="gap-2 rounded-lg bg-[#ff7a00] hover:bg-[#ff8a00] text-white shadow-md shadow-[#ff7a00]/20 font-bold"
              >
                <Plus size={14} strokeWidth={3} />
                <span className="hidden sm:inline">New Category</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-slate-100 border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
          <div className="p-4 rounded-full bg-slate-50 mb-4">
            <Database className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-bold text-lg">
            No Categories Found
          </h3>
          <p className="text-slate-500 text-sm max-w-xs mt-2 mb-6">
            Get started by creating your first category.
          </p>
          <AddCategory
            trigger={
              <Button className="rounded-xl bg-[#ff7a00] hover:bg-[#ff8a00] text-white gap-2 font-bold">
                <Plus size={16} />
                Create Category
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map((category: CategoryContent) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
