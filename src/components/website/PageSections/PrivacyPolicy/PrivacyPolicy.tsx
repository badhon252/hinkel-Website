import React from "react";

interface PrivacyPolicyProps {
  title?: string;
  content?: string;
}

const PrivacyPolicy = ({ title, content }: PrivacyPolicyProps) => {
  const sections = [
    {
      title: "1. Information We Collect",
      intro: "We may collect the following information:",
      items: [
        "Uploaded Images: Photos you upload to create coloring books",
        "Account Information: Name, email address, and basic contact details (if applicable)",
        "Order Information: Details related to your purchases or downloads",
        "Technical Data: Device type, browser type, and basic usage analytics",
      ],
    },
    {
      title: "2. How We Use Your Information",
      intro: "We use your information only to:",
      items: [
        "Process and convert uploaded images into coloring pages",
        "Generate print-ready PDFs or publishing files",
        "Improve our platform and user experience",
        "Communicate important updates or support messages",
      ],
      footer:
        "Your uploaded photos are used only for creating your requested product.",
    },
    {
      title: "3. Image & Content Privacy",
      items: [
        "Uploaded images remain your property",
        "We do not sell, share, or distribute your images",
        "Images are processed automatically by AI and are not used for marketing without permission",
        "Files may be temporarily stored only to complete your order",
      ],
    },
    {
      title: "4. Data Sharing",
      intro: "We do not sell or rent your personal data.",
      subIntro: "We may share limited information only when necessary with:",
      items: [
        "Trusted service providers (e.g., hosting, payment processing)",
        "Legal authorities if required by law",
      ],
    },
    {
      title: "5. Data Security",
      intro:
        "We take reasonable measures to protect your data using secure systems and industry-standard practices. However, no online platform can guarantee 100% security.",
    },
    {
      title: "6. Children's Privacy",
      intro:
        "Our platform may be used to create coloring books for children, but we do not knowingly collect personal data directly from children without parental consent.",
    },
    {
      title: "7. Your Rights",
      intro: "You have the right to:",
      items: [
        "Request deletion of your uploaded images",
        "Request access to or correction of your personal data",
        "Contact us with privacy-related concerns",
      ],
    },
    {
      title: "8. Changes to This Policy",
      intro:
        "We may update this Privacy Policy from time to time. Any changes will be posted on this page.",
    },
    {
      title: "9. Contact Us",
      intro:
        "If you have questions about this Privacy Policy or how your data is handled, please contact us through our website.",
    },
  ];

  const hasDynamicContent = Boolean(content);

  return (
    <section className="min-h-screen bg-secondary flex justify-center px-6 py-16">
      <div className="max-w-4xl w-full text-gray-700">
        {/* <div className="flex justify-center mb-8">
          <span className="px-4 py-1 text-sm rounded-full bg-[#FFE5D2] text-gray-600">
            Privacy Policy
          </span>
        </div> */}

        <h1 className="text-center text-3xl md:text-4xl font-semibold text-gray-600 mb-8">
          {hasDynamicContent ? title : "Your Privacy Matters to Us"}
        </h1>

        {hasDynamicContent ? (
          <div
            className="content-prose prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12"
            dangerouslySetInnerHTML={{ __html: content ?? "" }}
          />
        ) : (
          <>
            <p className="text-lg leading-relaxed mb-12">
              This Privacy Policy explains how we collect, use, and protect your
              information when you use our website and services.
            </p>

            {sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  {section.title}
                </h2>

                {section.intro && (
                  <p className="text-lg leading-relaxed mb-3">
                    {section.intro}
                  </p>
                )}

                {section.subIntro && (
                  <p className="text-lg leading-relaxed mb-3">
                    {section.subIntro}
                  </p>
                )}

                {section.items && (
                  <ul className="space-y-2 text-lg mb-3 ml-4">
                    {section.items.map((item, i) => (
                      <li key={i} className="list-disc">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.footer && (
                  <p className="text-lg leading-relaxed italic">
                    {section.footer}
                  </p>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default PrivacyPolicy;
