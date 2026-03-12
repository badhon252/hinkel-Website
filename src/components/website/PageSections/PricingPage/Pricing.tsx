"use client";

import { useSession } from "next-auth/react";
import { usePricing } from "@/features/book-creation/hooks/usePricing";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PricingTier {
  deliveryType: string;
  title?: string;
  subtitle?: string;
  price?: string | number;
  pageTiers?: { pageLimit: number; price: number }[];
  currency?: string;
}

const Pricing = () => {
  const { status } = useSession();
  const { prices, loading } = usePricing();

  const isAuthenticated = status === "authenticated";

  if (status === "loading" || (isAuthenticated && loading)) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Placeholder pricing for non-authenticated users
  const dummyPrices: PricingTier[] = [
    {
      deliveryType: "digital",
      title: "Digital PDF",
      subtitle: "Instant download",
      price: "19",
      currency: "USD",
      pageTiers: [{ pageLimit: 20, price: 19 }],
    },
    {
      deliveryType: "print",
      title: "Printed Book",
      subtitle: "Shipped to you",
      price: "39",
      currency: "USD",
      pageTiers: [{ pageLimit: 20, price: 39 }],
    },
    {
      deliveryType: "print&digital",
      title: "Digital PDF & Printed Book",
      subtitle: "Delivered & Instant",
      price: "49",
      currency: "USD",
      pageTiers: [{ pageLimit: 20, price: 49 }],
    },
  ];

  const getTierTitle = (type: string) => {
    switch (type) {
      case "digital":
        return "Digital PDF";
      case "print":
        return "Printed Book";
      case "print&digital":
        return "Digital PDF & Printed Book";
      default:
        return type;
    }
  };

  const getTierSubtitle = (type: string) => {
    switch (type) {
      case "digital":
        return "Instant download";
      case "print":
        return "Shipped to you";
      case "print&digital":
        return "Delivered & Instant";
      default:
        return "";
    }
  };

  return (
    <section className="min-h-screen bg-secondary flex justify-center px-6 py-16">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent{" "}
            <span className="text-primary italic">Pricing</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect format for your creative masterpiece. From
            instant digital downloads to professionally printed books.
          </p>
        </div>

        <div className="relative">
          {!isAuthenticated && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-white/30 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl">
              <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Pricing Locked
                </h3>
                <p className="text-gray-600 mb-8">
                  Website visitors are not able to see specific pricing details.
                  Please register to unlock full studio access and view our
                  current rates.
                </p>
                <div className="flex flex-col gap-3">
                  <Link href="/register">
                    <Button className="w-full bg-black hover:bg-gray-800 text-white py-6 rounded-xl font-bold text-lg">
                      Create a Free Account
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="w-full text-primary font-semibold"
                    >
                      Already have an account? Log In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div
            className={cn(
              "grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500",
              !isAuthenticated &&
                "blur-[6px] grayscale-[0.5] select-none pointer-events-none",
            )}
          >
            {(isAuthenticated ? (prices as PricingTier[]) : dummyPrices).map(
              (tier: PricingTier, index: number) => {
                const deliveryType = tier.deliveryType;
                const isPopular = deliveryType === "print";
                const sortedTiers = tier.pageTiers?.sort(
                  (a, b) => a.pageLimit - b.pageLimit,
                );
                const displayPrice = isAuthenticated
                  ? sortedTiers?.[0]?.price
                  : tier.price;
                const currency = tier.currency || "USD";

                return (
                  <div
                    key={index}
                    className={cn(
                      "relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 flex flex-col h-full",
                      isPopular
                        ? "border-primary shadow-xl shadow-primary/10 scale-105 z-10"
                        : "border-gray-100 shadow-sm hover:shadow-md",
                    )}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        Most Popular
                      </div>
                    )}

                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {getTierTitle(deliveryType)}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {getTierSubtitle(deliveryType)}
                      </p>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-4xl font-extrabold text-gray-900">
                          {currency === "USD" ? "$" : ""}
                          {displayPrice || "--"}
                        </span>
                        <span className="text-gray-500 font-medium">
                          Starting at
                        </span>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-gray-50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          Page Tiers
                        </p>
                        {sortedTiers?.map((t, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center py-1.5"
                          >
                            <span className="text-sm text-gray-600 font-medium">
                              Up to {t.pageLimit} Pages
                            </span>
                            <span className="text-sm font-bold text-primary">
                              {currency === "USD" ? "$" : ""}
                              {t.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8 grow">
                      {[
                        "AI-Powered Sketch Generation",
                        "Personalized Cover Art",
                        "Community Access",
                        deliveryType === "digital"
                          ? "High-Resolution PDF"
                          : "Premium Print Quality",
                        deliveryType === "print&digital"
                          ? "Both Formats Included"
                          : "Fast Turnaround",
                      ].map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-sm text-gray-600"
                        >
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/create-book">
                      <Button
                        className={cn(
                          "w-full py-6 rounded-xl font-bold transition-all",
                          isPopular
                            ? "bg-primary hover:bg-primary/90 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900",
                        )}
                      >
                        Start Designing
                      </Button>
                    </Link>
                  </div>
                );
              },
            )}
          </div>
        </div>

        <div className="mt-20 text-center bg-white/50 backdrop-blur-sm p-12 rounded-[40px] border border-gray-100 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Need a custom project?
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Looking for bulk orders, special event books, or corporate gifting?
            Our team can help you create something truly unique.
          </p>
          <Link href="/contact-us">
            <Button
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 rounded-xl font-bold text-lg transition-all"
            >
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
