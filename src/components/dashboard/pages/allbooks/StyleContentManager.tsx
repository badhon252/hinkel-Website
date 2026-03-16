"use client";

import { useState } from "react";
import {
  useGetCms,
  useDeleteCms,
  useGetCmsTypes,
} from "@/features/dashboard/hooks/useCms";
import { CmsContent } from "@/features/dashboard/api/cms.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Search, Filter, Layout } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import AddCmsContent from "./AddCmsContent";
import { toast } from "sonner";
import { format } from "date-fns";

const StyleContentManager = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | "all">("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<CmsContent | null>(null);

  // Queries
  const { data: cmsData, isLoading } = useGetCms({
    limit: 10, // Fetch more for client-side filtering simplicity for now
    type: typeFilter !== "all" ? typeFilter : undefined,
  });

  // Also fetch types to populate filter
  const { data: typesData } = useGetCmsTypes();

  // Mutation
  const { mutate: deleteCms, isPending: isDeleting } = useDeleteCms();
  console.log(isDeleting);
  const contents = cmsData?.data?.data?.contents || [];
  const availableTypes = (typesData?.data?.data || []).slice().sort();

  const filteredContents = contents.filter(
    (item: CmsContent) =>
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.type?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      deleteCms(id, {
        onSuccess: () => toast.success("Content deleted"),
        onError: () => toast.error("Failed to delete"),
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Streamlined Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Content <span className="text-[#ff7a00]">Manager</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Organize and curate rich content modules
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 rounded-xl focus:ring-[#ff7a00]/20 focus:border-[#ff7a00]/50"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-slate-200 text-slate-600 hover:text-[#ff7a00] hover:border-[#ff7a00]/30 transition-all"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {typeFilter === "all" ? "All Types" : typeFilter}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                All Types
              </DropdownMenuItem>
              {availableTypes.map((t: string) => (
                <DropdownMenuItem key={t} onClick={() => setTypeFilter(t)}>
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-[#ff7a00] hover:bg-[#ff8a20] text-white gap-2 rounded-xl shadow-lg shadow-[#ff7a00]/20 font-bold tracking-wide"
          >
            <Plus className="w-4 h-4" />
            Add Content
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-4/3 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : filteredContents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-200 text-center">
          <div className="p-4 rounded-full bg-slate-50 mb-4">
            <Layout className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-bold text-lg">No content found</h3>
          <p className="text-slate-500 text-sm max-w-xs mt-2 mb-6">
            There are no content items matching your current filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
            }}
            className="rounded-xl"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredContents.map((item: CmsContent) => (
            <div
              key={item._id}
              className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/60 hover:border-[#ff7a00]/40 transition-all duration-500 flex flex-col relative"
            >
              {/* Image Preview / Header Section */}
              <div className="relative aspect-video bg-linear-to-br from-slate-50 to-slate-100 overflow-hidden border-b border-slate-100">
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform duration-700">
                  <Layout className="w-12 h-12 text-slate-400" />
                </div>

                {/* ID Badge overlay */}
                <div className="absolute top-4 left-4">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 text-[#ff7a00] hover:bg-white backdrop-blur-md shadow-sm border border-slate-200/50 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
                  >
                    {item.type}
                  </Badge>
                </div>

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                  <Button
                    size="icon"
                    onClick={() => setEditingContent(item)}
                    className="h-10 w-10 rounded-xl bg-white text-slate-700 hover:text-[#ff7a00] hover:scale-110 shadow-xl transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => handleDelete(item._id)}
                    className="h-10 w-10 rounded-xl bg-white text-red-500 hover:bg-red-500 hover:text-white hover:scale-110 shadow-xl transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content Info */}
              <div className="p-6 flex-1 flex flex-col space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-slate-900 line-clamp-1 text-lg group-hover:text-[#ff7a00] transition-colors">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}{" "}
                      Content
                    </h3>
                  </div>
                  {item.plainText ? (
                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                      {item.plainText}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      No description available
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <span
                        className={`flex h-2.5 w-2.5 rounded-full ${item.isActive ? "bg-green-500" : "bg-slate-300"}`}
                      />
                      {item.isActive && (
                        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-40" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {item.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    {format(new Date(item.updatedAt), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-4xl bg-[#0F172A] border-slate-800 p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Add New Content</DialogTitle>
            <DialogDescription>
              Form to create new CMS content
            </DialogDescription>
          </DialogHeader>
          {/* We use AddCmsContent here but wrapped */}
          <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
            <AddCmsContent onSuccess={() => setIsAddOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingContent}
        onOpenChange={(open) => !open && setEditingContent(null)}
      >
        <DialogContent className="max-w-4xl bg-[#0F172A] border-slate-800 p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Form to edit existing CMS content
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
            {editingContent && (
              <AddCmsContent
                initialData={editingContent}
                onSuccess={() => setEditingContent(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StyleContentManager;
