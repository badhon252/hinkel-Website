"use client";

import React, { useState } from "react";
import {
  useStyles,
  useCreateStyle,
  useUpdateStyle,
} from "@/features/dashboard/hooks/useStyle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Edit2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const StyleHeader = () => {
  const { data: stylesData, isLoading } = useStyles();
  const updateStyle = useUpdateStyle();
  const createStyle = useCreateStyle();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    badgeText: "",
  });

  const style = stylesData?.data?.[0];

  const handleStartEditing = () => {
    if (style) {
      setFormData({
        title: style.title || "",
        subtitle: style.subtitle || "",
        badgeText: style.badgeText || "",
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (style?._id) {
        await updateStyle.mutateAsync({
          id: style._id,
          data: formData,
        });
        toast.success("Style updated successfully");
      } else {
        await createStyle.mutateAsync(formData);
        toast.success("Style created successfully");
      }
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save style");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-[2rem] border border-slate-200">
        <Loader2 className="w-6 h-6 animate-spin text-[#ff7a00]" />
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff7a00]/5 via-transparent to-orange-100/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-6 md:p-8">
        {!isEditing ? (
          /* View Mode */
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#ff7a00]/10 px-4 py-1.5 text-xs font-bold text-[#ff7a00] uppercase tracking-wider">
                <Sparkles size={12} />
                {style?.badgeText || "Style Header"}
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {style?.title || "Configure Style Page Header"}
              </h2>
              <p className="text-slate-500 font-medium max-w-xl leading-relaxed">
                {style?.subtitle ||
                  "Set the title, subtitle, and badge text that appears on the public style page."}
              </p>
            </div>

            <Button
              onClick={handleStartEditing}
              className="bg-[#ff7a00] hover:bg-[#ff8a00] text-white rounded-xl px-6 py-5 font-bold shadow-lg shadow-[#ff7a00]/20 gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Edit2 size={16} />
              Edit Header
            </Button>
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Editing Collections Header
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
                className="rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Badge Text
                </label>
                <Input
                  value={formData.badgeText}
                  onChange={(e) =>
                    setFormData({ ...formData, badgeText: e.target.value })
                  }
                  placeholder="e.g. Featured Collection"
                  className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#ff7a00]/20 focus:border-[#ff7a00]/50"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Explore Styles"
                  className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#ff7a00]/20 focus:border-[#ff7a00]/50"
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Subtitle
                </label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="e.g. Discover our latest trends and Collections..."
                  className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#ff7a00]/20 focus:border-[#ff7a00]/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="rounded-xl px-5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#ff7a00] hover:bg-[#ff8a00] text-white rounded-xl px-6 shadow-lg shadow-[#ff7a00]/20 font-bold gap-2"
                disabled={updateStyle.isPending || createStyle.isPending}
              >
                {updateStyle.isPending || createStyle.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
