// src/components/website/PageSections/TermsConditions/TermsConditions.tsx
"use client";

import React from "react";
import { useTermCondition } from "@/features/dashboard/hooks/use-terms-conditions";
import { Loader2 } from "lucide-react";

const TermsConditions = () => {
  const { data: termsData, isLoading } = useTermCondition();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get the first item from the array
  const terms =
    termsData?.data && termsData.data.length > 0 ? termsData.data[0] : null;

  const hasDynamicContent = terms && terms.content;

  return (
    <section className="min-h-screen bg-secondary flex justify-center px-6 py-16">
      <div className="max-w-4xl w-full text-gray-700">
        <div className="flex justify-center mb-8">
          <span className="px-4 py-1 text-sm rounded-full bg-[#FFE5D2] text-gray-600">
            Legal
          </span>
        </div>

        <h1 className="text-center text-3xl md:text-4xl font-semibold text-gray-600 mb-8">
          {hasDynamicContent ? terms.title : "Terms of Service"}
        </h1>

        {hasDynamicContent ? (
          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12"
            dangerouslySetInnerHTML={{ __html: terms.content }}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              Our terms and conditions are currently being updated. Please check
              back soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TermsConditions;
