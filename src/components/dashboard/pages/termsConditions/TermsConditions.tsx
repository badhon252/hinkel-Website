// src/components/dashboard/pages/termsConditions/TermsConditions.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useTermCondition,
  useCreateTermCondition,
  useUpdateTermCondition,
  useDeleteTermCondition,
} from "@/features/dashboard/hooks/use-terms-conditions";
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
import {
  Loader2,
  FileText,
  Plus,
  Save,
  Trash2,
  AlertTriangle,
  FileSignature,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const termsConditionsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type TermsConditionsSchemaType = z.infer<typeof termsConditionsSchema>;

const TermsConditions = () => {
  const { data: termsData, isLoading: isFetching } = useTermCondition();
  const { mutate: createTerms, isPending: isCreating } =
    useCreateTermCondition();
  const { mutate: updateTerms, isPending: isUpdating } =
    useUpdateTermCondition();
  const { mutate: deleteTerms, isPending: isDeleting } =
    useDeleteTermCondition();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [termsToDelete, setTermsToDelete] = useState<string | null>(null);

  // Check if a policy already exists
  const existingTerms =
    termsData?.data && termsData.data.length > 0 ? termsData.data[0] : null;
  const isEditMode = !!existingTerms;

  const form = useForm<TermsConditionsSchemaType>({
    resolver: zodResolver(termsConditionsSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (existingTerms) {
      form.reset({
        title: existingTerms.title,
        content: existingTerms.content,
      });
    }
  }, [existingTerms, form]);

  const onSubmit = (data: TermsConditionsSchemaType) => {
    if (isEditMode && existingTerms) {
      // Update existing terms
      updateTerms(
        { id: existingTerms._id, data },
        {
          onSuccess: () => {
            toast.success("Terms of Service updated successfully");
          },
          onError: (error: Error) => {
            toast.error("Failed to update Terms of Service: " + error.message);
          },
        },
      );
    } else {
      // Create new terms
      createTerms(data, {
        onSuccess: () => {
          toast.success("Terms of Service created successfully");
        },
        onError: (error: Error) => {
          toast.error("Failed to create Terms of Service: " + error.message);
        },
      });
    }
  };

  const handleDelete = () => {
    if (!termsToDelete) return;
    deleteTerms(termsToDelete, {
      onSuccess: () => {
        toast.success("Terms of Service deleted successfully");
        form.reset({ title: "", content: "" });
        setDeleteDialogOpen(false);
        setTermsToDelete(null);
      },
      onError: (error: Error) => {
        toast.error("Failed to delete Terms of Service: " + error.message);
        setDeleteDialogOpen(false);
      },
    });
  };

  const openDeleteDialog = (id: string) => {
    setTermsToDelete(id);
    setDeleteDialogOpen(true);
  };

  const isSaving = isCreating || isUpdating;

  if (isFetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileSignature className="h-8 w-8 text-primary" />
            Terms of Service
          </h1>
          <p className="text-slate-500 mt-1">
            {isEditMode
              ? "Update and manage your website's terms and conditions."
              : "Create your website's terms and conditions."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditMode && existingTerms && (
            <Button
              type="button"
              variant="outline"
              onClick={() => openDeleteDialog(existingTerms._id)}
              disabled={isDeleting}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 min-w-[120px]"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          )}
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 min-w-[160px]"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isEditMode ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Terms
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      {isEditMode && existingTerms && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
            Terms Active
          </span>
          <span className="text-xs text-slate-400">
            Last updated:{" "}
            {new Date(existingTerms.updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
            {/* Title */}
            <div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">
                      Terms Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Terms of Service"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Content Editor */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Terms Content
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

      {/* Info Box for create mode */}
      {!isEditMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              No Terms & Conditions Found
            </p>
            <p className="text-sm text-amber-600 mt-1">
              You haven&apos;t created terms and conditions yet. Fill in the
              form above and click &quot;Create Terms&quot; to publish it on
              your website.
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Terms of Service
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete these terms and conditions? This
              action cannot be undone and will remove it from your website.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TermsConditions;
