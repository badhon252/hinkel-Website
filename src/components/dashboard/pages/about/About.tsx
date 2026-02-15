// src/components/dashboard/pages/about/About.tsx
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useAbout,
  useUpdateAbout,
} from "@/features/website-content/hooks/use-about-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Editor from "@/components/dashboard/common/Editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, Info, FileText } from "lucide-react";

const aboutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type AboutSchemaType = z.infer<typeof aboutSchema>;

const About = () => {
  const { data: aboutData, isLoading: isFetching } = useAbout();
  const { mutate: updateAbout, isPending: isUpdating } = useUpdateAbout();

  const form = useForm<AboutSchemaType>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (aboutData?.data) {
      form.reset({
        title: aboutData.data.title,
        content: aboutData.data.content,
      });
    }
  }, [aboutData, form]);

  const onSubmit = (data: AboutSchemaType) => {
    updateAbout(data, {
      onSuccess: () => {
        toast.success("About Us content updated successfully");
      },
      onError: (error: Error) => {
        toast.error("Failed to update About Us content: " + error.message);
      },
    });
  };

  if (isFetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Info className="h-8 w-8 text-primary" />
            About Us Management
          </h1>
          <p className="text-slate-500 mt-1">
            Update and manage your website&apos;s &quot;About Us&quot; content.
          </p>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isUpdating}
          className="bg-primary hover:bg-primary/90 text-white min-w-[140px]"
        >
          {isUpdating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">
                      Page Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. About Us"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Page Content
                    </FormLabel>
                    <span className="text-xs text-slate-400">
                      Supports rich text formatting
                    </span>
                  </div>
                  <FormControl>
                    <Editor value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default About;
