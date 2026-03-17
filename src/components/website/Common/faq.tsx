"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import HeaderTitle from "./head-title";
import Link from "next/link";
import { usePublicFaq } from "@/features/website-content/hooks/use-faq-content";
import { Loader2 } from "lucide-react";

export function FAQ() {
  const { data, isLoading, isError } = usePublicFaq();

  if (isLoading) {
    return (
      <section className="py-24 px-6 bg-secondary">
        <div className="mx-auto max-w-4xl flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (isError || !data?.data) {
    return null;
  }

  const faqData = data.data;
  const activeItems = faqData.items
    .filter((item) => item.isActive)
    .sort((a, b) => a.order - b.order);

  // Find the default open item
  const defaultOpenItem = activeItems.find((item) => item.defaultOpen);
  const defaultValue = defaultOpenItem ? defaultOpenItem._id : undefined;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: activeItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.sanitized,
      },
    })),
  };

  return (
    <section className="py-24 px-6 bg-secondary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <div className="mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-16">
          <HeaderTitle title={faqData.title} />
          {faqData.subtitle && (
            <p className="text-gray-600 text-lg">{faqData.subtitle}</p>
          )}
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full space-y-4"
          defaultValue={defaultValue}
        >
          {activeItems.map((faq) => (
            <AccordionItem
              key={faq._id}
              value={faq._id}
              className="border-b border-gray-200"
            >
              <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline py-6 data-[state=open]:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-base leading-relaxed pb-6">
                {faq.answer.format === "html" ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: faq.answer.sanitized }}
                  />
                ) : (
                  faq.answer.sanitized
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {faqData.cta?.enabled && (
          <div className="mt-24 p-12 bg-white rounded-3xl text-center space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                {faqData.cta.heading}
              </h3>
              <p className="text-gray-600">{faqData.cta.text}</p>
            </div>
            <Link
              href={faqData.cta.button.href}
              target={faqData.cta.button.target}
            >
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-8 h-12 font-semibold">
                {faqData.cta.button.label}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
