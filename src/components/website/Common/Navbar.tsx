"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Package,
  Key,
  LayoutDashboard,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useContent } from "@/features/category-page/hooks/use-content";
import type { CategoryContent } from "@/features/category-page/types";

// Types
interface MenuItem {
  href: string;
  label: string;
}

interface UserProfileProps {
  session: Session | null;
}

interface MobileCategoryItemProps {
  category: CategoryContent;
  onNavigate: () => void;
}

interface DesktopCategoryDropdownProps {
  categories: CategoryContent[];
  isActive: boolean;
  showDropdown: boolean;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

// Constants
const MENU_ITEMS: MenuItem[] = [
  { href: "/", label: "Home" },
  { href: "/styles", label: "Styles" },
  { href: "/about-us", label: "About" },
  { href: "/contact-us", label: "Contact Us" },
];

const DROPDOWN_DELAY = 150;
const CONTENT_LIMIT = 12;

// Utility Functions
const isActiveRoute = (pathname: string, href: string): boolean => {
  return href === "/" ? pathname === href : pathname.startsWith(href);
};

const getInitials = (name?: string | null): string => {
  return name?.charAt(0).toUpperCase() || "";
};

const isAdminUser = (session: Session | null): boolean => {
  return session?.user?.role?.toLowerCase() === "admin";
};

// Subcomponents
const UserProfile = memo(({ session }: UserProfileProps) => {
  const isAdmin = isAdminUser(session);

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full border border-primary/20 p-0 hover:bg-primary/10"
          aria-label="User menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={session?.user?.image || ""}
              alt={session?.user?.name || "User"}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(session?.user?.name) || <User size={18} />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session?.user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin ? (
          <Link href="/dashboard">
            <DropdownMenuItem className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
          </Link>
        ) : (
          <>
            <Link href="/profile/orders">
              <DropdownMenuItem className="cursor-pointer">
                <Package className="mr-2 h-4 w-4" />
                <span>Order History</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/profile/change-password">
              <DropdownMenuItem className="cursor-pointer">
                <Key className="mr-2 h-4 w-4" />
                <span>Change Password</span>
              </DropdownMenuItem>
            </Link>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

UserProfile.displayName = "UserProfile";

const MobileCategoryItem = memo(
  ({ category, onNavigate }: MobileCategoryItemProps) => (
    <Link
      href={`/category/${category.type}`}
      onClick={onNavigate}
      className="group flex items-center gap-3 p-3 pl-8 rounded-lg hover:bg-primary/5 transition-colors"
    >
      <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
        {category.type?.toUpperCase()}
      </span>
    </Link>
  ),
);

MobileCategoryItem.displayName = "MobileCategoryItem";

const DesktopCategoryDropdown = memo(
  ({
    categories,
    isActive,
    showDropdown,
    dropdownRef,
    onMouseEnter,
    onMouseLeave,
    onClose,
  }: DesktopCategoryDropdownProps) => (
    <div
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative h-full flex items-center"
    >
      <Link
        href="/styles"
        className={cn(
          "flex items-center gap-1 transition-all duration-200 hover:text-primary relative pb-1",
          isActive || showDropdown
            ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
            : "text-primary-foreground",
        )}
      >
        Styles
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            showDropdown && "rotate-180",
          )}
          aria-hidden="true"
        />
      </Link>
      {showDropdown && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 min-w-[250px] w-auto bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-4 gap-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/category/${category.type}`}
              onClick={onClose}
              className="group flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                  {category.type?.toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  ),
);

DesktopCategoryDropdown.displayName = "DesktopCategoryDropdown";

const Logo = memo(() => (
  <Link href="/" className="flex items-center">
    <Image
      src="/images/logo.png"
      alt="Logo"
      width={150}
      height={150}
      className="cursor-pointer"
      priority
    />
  </Link>
));

Logo.displayName = "Logo";

// Main Component
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileStylesOpen, setMobileStylesOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { data: contentData } = useContent({ limit: CONTENT_LIMIT });
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const categories =
    contentData?.data?.filter(
      (c: CategoryContent) => c.type?.toLowerCase() !== "home",
    ) || [];

  const isActive = useCallback(
    (href: string) => isActiveRoute(pathname, href),
    [pathname],
  );

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowDropdown(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, DROPDOWN_DELAY);
  }, []);

  const handleDropdownClose = useCallback(() => {
    setShowDropdown(false);
  }, []);

  const handleMobileNavClose = useCallback(() => {
    setOpen(false);
    setMobileStylesOpen(false);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Adjust mobile menu state during render if pathname changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setMobileStylesOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md bg-blue-100 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-8 flex justify-between items-center py-4">
        <Logo />

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 font-medium items-center">
          {MENU_ITEMS.map((item) => (
            <li key={item.href} className="relative h-full flex items-center">
              {item.label === "Styles" ? (
                <DesktopCategoryDropdown
                  categories={categories}
                  isActive={isActive(item.href)}
                  showDropdown={showDropdown}
                  dropdownRef={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClose={handleDropdownClose}
                />
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-all duration-200 hover:text-primary relative pb-1",
                    isActive(item.href)
                      ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                      : "text-primary-foreground",
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {status === "unauthenticated" ? (
            <Link href="/login">
              <Button
                variant="outline"
                className="border-primary text-primary-foreground hover:bg-primary/10 px-8 rounded-lg font-semibold transition-all"
              >
                Log In
              </Button>
            </Link>
          ) : (
            <UserProfile session={session} />
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center space-x-4">
          {status === "authenticated" && <UserProfile session={session} />}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-primary"
                aria-label="Toggle menu"
              >
                {open ? <X size={28} /> : <Menu size={28} />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col space-y-2 mt-8">
                {MENU_ITEMS.map((item) => (
                  <div key={item.href}>
                    {item.label === "Styles" ? (
                      <Collapsible
                        open={mobileStylesOpen}
                        onOpenChange={setMobileStylesOpen}
                      >
                        <CollapsibleTrigger asChild>
                          <button
                            className={cn(
                              "w-full px-5 py-3 rounded-lg font-medium text-lg flex items-center justify-between",
                              isActive(item.href)
                                ? "text-primary bg-primary/10 font-semibold"
                                : "text-gray-700",
                            )}
                          >
                            {item.label}
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform duration-200",
                                mobileStylesOpen && "rotate-180",
                              )}
                            />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-1">
                          <Link
                            href="/styles"
                            onClick={handleMobileNavClose}
                            className="block px-5 py-2 pl-8 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          >
                            All Styles
                          </Link>
                          {categories.map((category: CategoryContent) => (
                            <MobileCategoryItem
                              key={category._id}
                              category={category}
                              onNavigate={handleMobileNavClose}
                            />
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={handleMobileNavClose}
                        className={cn(
                          "block px-5 py-3 rounded-lg font-medium text-lg",
                          isActive(item.href)
                            ? "text-primary bg-primary/10 font-semibold"
                            : "text-gray-700",
                        )}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
                {status === "unauthenticated" && (
                  <div className="flex flex-col px-5 pt-6 mt-4 border-t">
                    <Link href="/login" onClick={handleMobileNavClose}>
                      <Button
                        variant="outline"
                        className="w-full border-primary text-primary"
                      >
                        Log In
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
