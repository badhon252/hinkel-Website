"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  NotebookText,
  LogOut,
  Book,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  Info,
  Users,
  Key,
  FileSignature,
} from "lucide-react";
import { useState } from "react";

import { signOut } from "next-auth/react";
import Image from "next/image";
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

const navigation = [
  {
    group: "General",
    items: [{ name: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Catalog Management",
    items: [
      { name: "All Categories", href: "/dashboard/AllCategories", icon: Book },
      { name: "All Books", href: "/dashboard/allbooks", icon: BookOpen },
      {
        name: "Set Pricing",
        href: "/dashboard/setPricing",
        icon: NotebookText,
      },
    ],
  },
  {
    group: "Audience",
    items: [
      { name: "Subscribers", href: "/dashboard/subscribers", icon: Users },
    ],
  },
  {
    group: "Site Content",
    items: [
      { name: "About Us", href: "/dashboard/about", icon: Info },
      { name: "FAQs & CTA", href: "/dashboard/faqs", icon: HelpCircle },
    ],
  },
  {
    group: "Legal & Policies",
    items: [
      { name: "Privacy Policy", href: "/dashboard/privacy", icon: ShieldCheck },
      {
        name: "Return Policy",
        href: "/dashboard/return-policy",
        icon: RotateCcw,
      },
      {
        name: "Terms & Conditions",
        href: "/dashboard/terms-conditions",
        icon: FileSignature,
      },
    ],
  },
  {
    group: "Account",
    items: [
      {
        name: "Change Password",
        href: "/dashboard/change-password",
        icon: Key,
      },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col bg-white border-r border-gray-200 fixed shadow-sm z-50">
      <SidebarContent />
    </aside>
  );
}

export function SidebarContent({
  onNavItemClick,
}: {
  onNavItemClick?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
    setOpen(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="flex items-center py-8 justify-center px-6 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center ">
          <Image
            src="/images/logo.png"
            alt="Company Logo"
            width={160}
            height={160}
            className="cursor-pointer transition-transform hover:scale-105"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto min-h-0 px-4 py-4 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
        <div className="space-y-8 pb-4">
          {navigation.map((group) => (
            <div key={group.group} className="space-y-2">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400/80">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname === item.href ||
                        pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onNavItemClick}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                          isActive
                            ? "bg-primary text-white"
                            : "bg-gray-50 group-hover:bg-gray-100",
                        )}
                      >
                        <item.icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="flex-1 text-nowrap">{item.name}</span>
                      {isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 p-4 bg-gray-50/30 flex-shrink-0">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 px-4 cursor-pointer rounded-xl font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent hover:border-red-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100">
                <LogOut className="h-4.5 w-4.5" />
              </div>
              Log Out
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Confirm Logout
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Are you sure you want to log out? You will need to sign in again
                to access your dashboard.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-3 mt-4">
              <Button
                className="cursor-pointer font-semibold rounded-lg"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="cursor-pointer font-semibold rounded-lg"
                variant="destructive"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
