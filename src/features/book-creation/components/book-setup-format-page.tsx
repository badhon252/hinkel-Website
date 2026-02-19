"use client";

import { useState, useMemo } from "react";
import StepIndicator from "@/components/step-indicator";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useBookStore } from "@/features/book-creation/store/book-store";
import { usePricing } from "@/features/book-creation/hooks/usePricing";
import { useConfirmPayment } from "@/features/book-creation/hooks/usePayment";
import { DeliveryMethodCard } from "./delivery-mothod-card";
import { BookStore, OutputFormat, DeliveryType } from "../types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthModal } from "@/components/shared/AuthModal";

export default function BookSetupFormatPage() {
  const setStep = useBookStore((state: BookStore) => state.setStep);
  const setPendingPageCount = useBookStore(
    (state: BookStore) => state.setPendingPageCount,
  );
  const setOutputFormat = useBookStore(
    (state: BookStore) => state.setOutputFormat,
  );
  const setBookTitle = useBookStore((state: BookStore) => state.setBookTitle);
  const setOrderId = useBookStore((state: BookStore) => state.setOrderId);
  const { bookTitle, pageCount, outputFormat, bookType, hasPaid } =
    useBookStore();
  const { data: session } = useSession();
  const router = useRouter();

  const { prices, loading: pricingLoading } = usePricing();
  const { confirmPayment, isLoading: isConfirming } = useConfirmPayment();

  const [title, setTitle] = useState(bookTitle || "");
  const [selectedPages, setSelectedPages] = useState(pageCount || 20);
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>(
    outputFormat || "pdf",
  );
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const steps = ["Cover Art", "Details", "Payment", "Content", "Review"];

  const handleStepClick = (index: number) => {
    // Navigate based on step index
    switch (index) {
      case 0:
        setStep("cover");
        break;
      case 1:
        // Already here
        break;
      // Case 2 is Payment (skipped for navigation mostly)
      case 3:
        setStep("images");
        break;
      case 4:
        setStep("finalize");
        break;
    }
  };

  const deliveryTypeMap = useMemo<Record<OutputFormat, DeliveryType>>(
    () => ({
      pdf: "digital",
      printed: "print",
      "pdf&printed": "print&digital",
    }),
    [],
  );

  const pageOptions = useMemo(() => {
    const currentType = deliveryTypeMap[selectedFormat];
    const methodPricing = prices?.find((p) => p.deliveryType === currentType);
    if (!methodPricing) return [];

    return methodPricing.pageTiers
      .sort((a, b) => a.pageLimit - b.pageLimit)
      .map((tier, index, arr) => ({
        count: tier.pageLimit,
        label: tier.pageLimit.toString(),
        popular: index === Math.floor(arr.length / 2), // Make the middle one popular as a heuristic
        price: tier.price,
      }));
  }, [prices, selectedFormat, deliveryTypeMap]);

  const handleFormatSelect = (format: OutputFormat) => {
    setSelectedFormat(format);
    const currentType = deliveryTypeMap[format];
    const methodPricing = prices?.find((p) => p.deliveryType === currentType);
    if (methodPricing && methodPricing.pageTiers.length > 0) {
      const tiers = [...methodPricing.pageTiers].sort(
        (a, b) => a.pageLimit - b.pageLimit,
      );
      const isValid = tiers.some((t) => t.pageLimit === selectedPages);
      if (!isValid) {
        setSelectedPages(tiers[0].pageLimit);
      }
    }
  };

  const deliveryMethods = useMemo(() => {
    return [
      {
        id: "pdf" as OutputFormat,
        apiType: "digital" as const,
        title: "Digital PDF",
        subtitle: "Instant download",
      },
      {
        id: "printed" as OutputFormat,
        apiType: "print" as const,
        title: "Printed Book",
        subtitle: "Shipped to you",
      },
      {
        id: "pdf&printed" as OutputFormat,
        apiType: "print&digital" as const,
        title: "Digital PDF & Printed Book",
        subtitle: "Delivered & Instant",
      },
    ];
  }, []);

  const handleContinue = async () => {
    const newErrors: { title?: string } = {};
    if (!title.trim()) {
      newErrors.title = "Book title is required";
      toast.error(newErrors.title);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!session?.user?.id) {
      setIsAuthModalOpen(true);
      return;
    }

    // Map output format to API delivery type
    const deliveryTypeMap: Record<OutputFormat, DeliveryType> = {
      pdf: "digital",
      printed: "print",
      "pdf&printed": "print&digital",
    };

    // If already paid, skip payment and go to next step
    if (hasPaid) {
      // Optional: Logic to check if critical details changed could go here
      // For now, we assume user is paying for specific session which is valid
      setStep("images");
      return;
    }

    try {
      const response = await confirmPayment({
        userId: session.user.id,
        pageCount: selectedPages,
        deliveryType: deliveryTypeMap[selectedFormat],
        bookType: bookType,
      });

      if (response.success && response.sessionUrl) {
        setBookTitle(title);
        setPendingPageCount(selectedPages);
        setOutputFormat(selectedFormat);
        setOrderId(response.orderId);

        // Redirect to Stripe
        router.push(response.sessionUrl);
      } else {
        toast.error("Failed to create payment session");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong during payment confirmation";
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    setStep("landing");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StepIndicator
        steps={steps}
        currentStep={1}
        onStepClick={handleStepClick}
      />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="bg-white rounded-[16px] shadow-[0px_7px_25px_-13.739px_rgba(0,0,0,0.07)] p-5 md:p-12">
          {/* Book Title Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-medium font-poppins text-[#212121] mb-2">
              Book Title
            </h2>
            <div className="border-2 border-[#e1e3e5] rounded-xl flex items-center px-4 py-2 h-[50px]">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({});
                }}
                placeholder="My Amazing Coloring Book"
                className="w-full text-base font-poppins text-[#6c757d] placeholder-[#6c757d] focus:outline-none bg-transparent"
              />
            </div>
            {errors.title && (
              <p className="text-red-500 text-sm mt-2">{errors.title}</p>
            )}
          </div>

          {/* Choose Your Package Header */}
          <h3 className="text-2xl font-medium font-inter text-black mb-6">
            Choose Your Package
          </h3>

          {/* Number of Pages Section */}
          <div className="mb-8 pb-4">
            <h4 className="text-xl font-normal font-inter text-black mb-4">
              Number of Pages
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {pageOptions.map((option) => (
                <button
                  key={option.count}
                  onClick={() => !hasPaid && setSelectedPages(option.count)}
                  disabled={hasPaid}
                  className={`relative h-[160px] rounded-xl flex items-center justify-center transition-all ${
                    hasPaid ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    selectedPages === option.count
                      ? "border-2 border-[#ff8b36] bg-[#fffaf3]"
                      : "border-2 border-[#d5d5d5] bg-white hover:border-[#d5d5d5]"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="text-[32px] font-medium font-inter text-black text-center">
                      {option.count}
                    </div>
                    <div className="text-base font-normal font-inter text-black">
                      Page
                    </div>
                  </div>
                  {option.popular && (
                    <div className="absolute bottom-[-14px] left-1/2 -translate-x-1/2">
                      <div className="bg-[#ff8b36] text-white text-sm font-semibold px-4 py-2 rounded-lg">
                        Popular
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* Delivery Method Section */}
          <div className="mt-6 relative">
            <h4 className="text-xl font-normal font-inter text-black mb-6">
              Delivery Method
            </h4>

            {pricingLoading ? (
              <div className="flex justify-center items-center h-[280px]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
                {deliveryMethods.map((method) => (
                  <DeliveryMethodCard
                    key={method.id}
                    method={method}
                    selectedPages={selectedPages}
                    selectedFormat={selectedFormat}
                    onSelect={handleFormatSelect}
                    prices={prices}
                    disabled={hasPaid}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-6 justify-between mt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-3 bg-[#e5e7eb] text-[#364153] px-8 py-4 rounded-xl font-inter font-semibold text-base hover:bg-gray-300 transition-colors h-[56px] min-w-[120px]"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <button
            onClick={handleContinue}
            disabled={isConfirming}
            className="flex items-center gap-3 bg-[#ff8b36] text-white px-8 py-4 rounded-xl font-inter font-semibold text-base hover:bg-orange-600 transition-colors h-[56px] min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowLeft size={20} className="rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectUrl="/create-book"
      />
    </div>
  );
}
