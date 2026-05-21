// src/components/website/PageSections/RefundPolicy/RefundPolicy.tsx
import React from "react";
import type { ReturnPolicy } from "@/features/dashboard/types/return-policy.types";

interface RefundPolicyProps {
  policy?: ReturnPolicy | null;
}

const RefundPolicy = ({ policy }: RefundPolicyProps) => {
  const hasDynamicContent = Boolean(policy?.content);

  return (
    <section className="min-h-screen bg-secondary flex justify-center px-6 py-16">
      <div className="max-w-4xl w-full text-gray-700">
        {/* <div className="flex justify-center mb-8">
          <span className="px-4 py-1 text-sm rounded-full bg-[#FFE5D2] text-gray-600">
            Return &amp; Refund Policy
          </span>
        </div> */}

        <h1 className="text-center text-3xl md:text-4xl font-semibold text-gray-600 mb-8">
          {hasDynamicContent ? policy?.title : "Return & Refund Policy"}
        </h1>

        {hasDynamicContent ? (
          <div
            className="content-prose prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12"
            dangerouslySetInnerHTML={{ __html: policy?.content ?? "" }}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              Our return and refund policy is currently being updated. Please
              check back soon or contact us for more information.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RefundPolicy;
