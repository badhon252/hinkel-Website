"use client";

// import React from "react";
import { usePublicAbout } from "@/features/website-content/hooks/use-about-content";
import { Loader2 } from "lucide-react";

const Aboutus = () => {
  const { data: aboutData, isLoading, isError } = usePublicAbout();

  // const audiences = [
  //   { label: "Children", desc: "for creativity, learning, and fun" },
  //   { label: "Pet lovers", desc: "to celebrate beloved pets" },
  //   {
  //     label: "Seniors & memory care",
  //     desc: "for relaxation and cognitive engagement",
  //   },
  //   {
  //     label: "Adults & novelty users",
  //     desc: "for stress relief, hobbies, and unique gifts",
  //   },
  // ];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !aboutData?.data) {
    return (
      <section className="min-h-screen bg-secondary flex justify-center px-6 py-16">
        <div className="max-w-4xl w-full text-center">
          <h2 className="text-2xl font-semibold text-gray-600">
            Failed to load content
          </h2>
          <p className="text-gray-500 mt-2">Please try again later.</p>
        </div>
      </section>
    );
  }

  const { title, content } = aboutData.data;

  return (
    <section className="min-h-screen bg-secondary flex justify-center px-6 py-16">
      <div className="max-w-4xl w-full text-gray-700">
        {/* <div className="flex justify-center mb-8 ">
          <span className="px-4 py-1 text-sm rounded-full bg-[#FFE5D2] text-gray-600">
            About Us
          </span>
        </div> */}

        <h1 className="text-center text-3xl md:text-4xl font-semibold text-gray-600 mb-8">
          {title}
        </h1>

        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Existing audience list as a fallback or additional info if content doesn't cover it */}
        {/* {!content.includes("Children") && (
          <>
            <p className="text-lg leading-relaxed mb-6 font-semibold">
              Who we serve:
            </p>
            <ul className="space-y-3 text-lg mb-10">
              {audiences.map(({ label, desc }) => (
                <li key={label}>
                  <span className="font-semibold">{label}</span> – {desc}
                </li>
              ))}
            </ul>
          </>
        )} */}
      </div>
    </section>
  );
};

export default Aboutus;
