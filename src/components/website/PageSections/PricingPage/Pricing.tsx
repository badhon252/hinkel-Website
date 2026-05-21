import type { PricingData } from "@/features/book-creation/types";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
interface PricingProps {
  prices: PricingData[];
}

const FALLBACK_PRICES: PricingData[] = [
  {
    _id: "fallback-digital",
    deliveryType: "digital",
    currency: "USD",
    pageTiers: [{ pageLimit: 20, price: 19 }],
    createdAt: "",
    updatedAt: "",
  },
  {
    _id: "fallback-print",
    deliveryType: "print",
    currency: "USD",
    pageTiers: [{ pageLimit: 20, price: 39 }],
    createdAt: "",
    updatedAt: "",
  },
  {
    _id: "fallback-print-digital",
    deliveryType: "print&digital",
    currency: "USD",
    pageTiers: [{ pageLimit: 20, price: 49 }],
    createdAt: "",
    updatedAt: "",
  },
];

const Pricing = ({ prices }: PricingProps) => {
  const tiers = prices.length > 0 ? prices : FALLBACK_PRICES;

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
        return "Delivered by email";
      case "print":
        return "Shipped to you";
      case "print&digital":
        return "Email + print delivery";
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
            email-delivered digital PDFs to professionally printed books.
          </p>
        </div>

        <div className="relative">
          <div
            className={cn(
              "grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500",
            )}
          >
            {tiers.map((tier, index: number) => {
              const deliveryType = tier.deliveryType;
              const isPopular = deliveryType === "print";
              const sortedTiers = [...(tier.pageTiers || [])].sort(
                (a, b) => a.pageLimit - b.pageLimit,
              );
              const displayPrice = sortedTiers?.[0]?.price;
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
            })}
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
