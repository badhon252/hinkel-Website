// src/components/website/PageSections/TermsConditions/TermsConditions.tsx
import React from "react";
import type { TermCondition } from "@/features/dashboard/types/terms-conditions.types";

interface TermsConditionsProps {
  terms?: TermCondition | null;
}

const TermsConditions = ({ terms }: TermsConditionsProps) => {
  const hasDynamicContent = Boolean(terms?.content);

  return (
    <section className="min-h-screen bg-secondary flex justify-center px-6 py-16">
      <div className="max-w-4xl w-full text-gray-700">
        <div className="flex justify-center mb-8">
          <span className="px-4 py-1 text-sm rounded-full bg-[#FFE5D2] text-gray-600">
            Legal
          </span>
        </div>

        <h1 className="text-center text-3xl md:text-4xl font-semibold text-gray-600 mb-8">
          {hasDynamicContent ? terms?.title : "Terms of Service"}
        </h1>

        {hasDynamicContent ? (
          <div
            className="content-prose prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12"
            dangerouslySetInnerHTML={{ __html: terms?.content ?? "" }}
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
