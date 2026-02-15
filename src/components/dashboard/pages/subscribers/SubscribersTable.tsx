"use client";

import React, { useState } from "react";
import {
  Trash2,
  Mail,
  Calendar,
  Search,
  Loader2,
  MailQuestion,
  Download,
} from "lucide-react";
import {
  useSubscribers,
  useDeleteSubscriber,
} from "@/features/newsletter/hooks/use-subscribers";
import { getAllSubscribers } from "@/features/newsletter/api/newsletter.api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
}

export function SubscribersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: subscribersData,
    isLoading,
    error,
  } = useSubscribers({ q: searchTerm });
  const { mutate: deleteSub, isPending: isDeleting } = useDeleteSubscriber();
  const [isExporting, setIsExporting] = useState(false);

  const subscribers = subscribersData?.data || [];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Fetch all subscribers without filters to ensure complete list export
      const response = await getAllSubscribers({ limit: 0 }); // Assuming limit: 0 or a very large number returns all
      const allSubscribers = response?.data || [];

      if (!allSubscribers || allSubscribers.length === 0) {
        toast.error("No subscribers to export");
        return;
      }

      const headers = ["ID", "Email Address", "Subscription Date"];
      const csvData = allSubscribers.map((sub: Subscriber) => [
        sub._id,
        sub.email,
        sub.createdAt
          ? new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(sub.createdAt))
          : "N/A",
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map((row: string[]) =>
          row.map((cell: string) => `"${cell}"`).join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `subscribers_full_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Subscriber list exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export subscribers");
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-3">
        <MailQuestion className="h-5 w-5" />
        <p className="font-medium">
          Failed to load subscribers. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by email..."
            className="pl-10 h-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-[#ff7a00]/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleExport}
            disabled={isExporting || subscribers.length === 0}
            className="bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white gap-2 h-10 px-4 rounded-xl shadow-sm shadow-orange-200 transition-all active:scale-95 disabled:opacity-70"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isExporting ? "Exporting..." : "Export CSV"}
            </span>
          </Button>
          <div className="text-sm font-medium text-slate-500 whitespace-nowrap">
            Total Subscribers:{" "}
            <span className="text-slate-900">{subscribers.length}</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#ff7a00]" />
            <p className="text-sm font-medium animate-pulse">
              Syncing subscribers database...
            </p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <div className="p-4 rounded-full bg-slate-50">
              <Mail className="h-8 w-8 opacity-20" />
            </div>
            <p className="text-lg font-bold uppercase tracking-widest opacity-50">
              No Subscribers Found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    Email Address
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    Subscription Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subscribers.map((sub: Subscriber) => (
                  <tr
                    key={sub._id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#ff7a00]">
                          <Mail className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-slate-900">
                          {sub.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {sub.createdAt
                            ? new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }).format(new Date(sub.createdAt))
                            : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Revoke Subscription?</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove{" "}
                              <span className="font-bold text-slate-900">
                                {sub.email}
                              </span>
                              ? This action cannot be undone and they will no
                              longer receive newsletter updates.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button
                              variant="destructive"
                              onClick={() => deleteSub(sub._id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Processing..." : "Confirm Removal"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
