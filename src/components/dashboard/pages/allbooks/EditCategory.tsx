"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ImagePlus, Type, Layers, AlignLeft, Zap, X } from "lucide-react";
import Image from "next/image";
import { useUpdateCategory } from "@/features/dashboard/hooks/useCategory";

import { CategoryContent } from "@/features/category-page/types";

const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  subtitle: z.string().min(2, "Subtitle is required"),
  type: z.string().min(2, "Type is required"),
  prompt: z.string().optional(),
  image: z.any().optional(),
  gallery: z.any().optional(),
});

interface EditCategoryProps {
  category: CategoryContent;
  onSuccess: () => void;
}

const EditCategory = ({ category, onSuccess }: EditCategoryProps) => {
  const [preview, setPreview] = useState<string | null>(category.image || null);
  const [galleryPreviews, setGalleryPreviews] = useState<(string | File)[]>(
    category.gallery || [],
  );
  const { mutate: updateCategory, isPending } = useUpdateCategory();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: category.title || "",
      subtitle: category.subtitle || "",
      type: category.type || "",
      prompt: category.prompt || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("subtitle", values.subtitle);
    formData.append("type", values.type);
    if (values.prompt) {
      formData.append("prompt", values.prompt);
    }

    if (values.image && values.image[0]) {
      formData.append("image", values.image[0]);
    }

    // Handle gallery: only send new Files under 'gallery'
    galleryPreviews.forEach((item) => {
      if (item instanceof File) {
        formData.append("gallery", item);
      }
    });

    // Detect removed gallery URLs and append to 'removeGalleryUrls'
    const initialGallery = category.gallery || [];
    const currentUrls = galleryPreviews.filter(
      (item) => typeof item === "string",
    );
    const removedUrls = initialGallery.filter(
      (url) => !currentUrls.includes(url as string),
    );

    removedUrls.forEach((url) => {
      formData.append("removeGalleryUrls", url as string);
    });

    updateCategory(
      { id: category._id, data: formData },
      {
        onSuccess: () => {
          toast.success("Category updated successfully");
          onSuccess();
        },
        //eslint-disable-next-line
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Something went wrong");
        },
      },
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      form.setValue("image", e.target.files);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setGalleryPreviews((prev) => [...prev, ...newFiles]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative overflow-hidden p-6 rounded-3xl">
      {/* Animated Background Layers */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-3xl" />
      <div className="absolute inset-0 bg-linear-to-br from-[#ff7a00]/5 via-transparent to-blue-500/5" />

      {/* Decorative Floating Orbs */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#ff7a00] rounded-full blur-[60px] opacity-10 animate-pulse" />
      <div
        className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-10 animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title Input */}
              <div className="group/field relative space-y-2">
                <label className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 group-focus-within/field:text-[#ff7a00] transition-colors">
                  <Type size={12} /> Title
                </label>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Input
                          placeholder="e.g. Premium Selection"
                          {...field}
                          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-6 text-white placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-[#ff7a00]/30 focus-visible:border-[#ff7a00]/50 transition-all duration-500 shadow-xl"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] pt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Type Input (Changed from Select to allow custom typing) */}
              <div className="group/field relative space-y-2">
                <label className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 group-focus-within/field:text-[#ff7a00] transition-colors">
                  <Layers size={12} /> Type
                </label>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Input
                          placeholder="e.g. kids, pets, adults..."
                          {...field}
                          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-6 text-white placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-[#ff7a00]/30 focus-visible:border-[#ff7a00]/50 transition-all duration-500 shadow-xl"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] pt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Subtitle Input */}
              <div className="group/field relative space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 group-focus-within/field:text-[#ff7a00] transition-colors">
                  <AlignLeft size={12} /> Subtitle
                </label>
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Input
                          placeholder="Brief description of the category..."
                          {...field}
                          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-6 text-white placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-[#ff7a00]/30 focus-visible:border-[#ff7a00]/50 transition-all duration-500 shadow-xl"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] pt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Prompt Input */}
              <div className="group/field relative space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 group-focus-within/field:text-[#ff7a00] transition-colors">
                  <AlignLeft size={12} /> Prompt
                </label>
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Input
                          placeholder="Describe this category node..."
                          {...field}
                          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-6 text-white placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-[#ff7a00]/30 focus-visible:border-[#ff7a00]/50 transition-all duration-500 shadow-xl"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] pt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image Upload Area */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-3 px-1">
                  <ImagePlus size={12} /> Visual Marker
                </label>
                <div className="relative group/upload h-[200px] border-2 border-dashed border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#ff7a00]/40 bg-black/20">
                  {preview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-contain p-4"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <label className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-full text-white text-xs font-bold transition-all">
                          Replace Image
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer group-hover/upload:bg-white/5 transition-colors">
                      <div className="w-12 h-12 bg-[#ff7a00]/10 rounded-full flex items-center justify-center mb-3 group-hover/upload:scale-110 transition-transform duration-500">
                        <ImagePlus className="w-6 h-6 text-[#ff7a00]" />
                      </div>
                      <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Upload Frame
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Gallery Management Area */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-3 px-1">
                  <ImagePlus size={12} /> Gallery Images
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {galleryPreviews.map((item, index) => {
                    const url =
                      typeof item === "string"
                        ? item
                        : URL.createObjectURL(item);
                    return (
                      <div
                        key={index}
                        className="relative aspect-square border border-white/10 rounded-xl overflow-hidden group/gallery"
                      >
                        <Image
                          src={url}
                          alt={`Gallery ${index}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover/gallery:opacity-100 transition-opacity z-20"
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    );
                  })}
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-all group/add-gallery">
                    <ImagePlus className="w-5 h-5 text-white/40 group-hover/add-gallery:text-[#ff7a00] transition-colors" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-14 bg-linear-to-r from-[#ff7a00] to-[#ff9d42] hover:from-[#ff8a20] hover:to-[#ffad5a] text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_10px_20px_-10px_rgba(255,122,0,0.5)] transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 animate-spin" /> Updating Node...
                </div>
              ) : (
                "Update Category"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditCategory;
