"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { memo, useState } from "react";
import { useNewsletterMutation } from "../hooks/use-newsletter-mutation";
import { Loader2 } from "lucide-react";

export const NewsletterSection = memo(() => {
  const [email, setEmail] = useState("");
  const { mutate, isPending } = useNewsletterMutation();

  const handleSubscribe = () => {
    if (!email) {
      return;
    }

    if (!email.includes("@")) {
      return;
    }

    mutate(email, {
      onSuccess: () => {
        setEmail("");
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubscribe();
    }
  };

  return (
    <div className="md:col-span-4 lg:col-span-3">
      <h3 className="text-gray-900 font-semibold mb-6">Join Our Newsletter</h3>
      <div className=" space-y-2">
        <label htmlFor="footer-email" className="sr-only">
          Email address
        </label>
        <Input
          id="footer-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter your email"
          disabled={isPending}
          className="bg-white border-gray-300 focus:border-primary focus:ring-primary h-11"
          aria-label="Email address for newsletter"
        />
        <Button
          onClick={handleSubscribe}
          disabled={isPending}
          className="bg-primary hover:bg-[#e67a2e] text-white px-6 h-11 font-semibold transition-all duration-300 focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>
    </div>
  );
});

NewsletterSection.displayName = "NewsletterSection";
