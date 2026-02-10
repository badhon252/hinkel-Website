"use client";

import * as z from "zod";
import Image from "next/image";
import { memo, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContactMutation } from "../hooks/use-contact-mutation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// Move schema outside component to prevent recreation on each render
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long"),
  message: z.string().min(1, "Message is required"),
  privacyPolicy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Country codes data
const COUNTRY_CODES = [
  { code: "US", label: "US", dialCode: "+1" },
  { code: "UK", label: "UK", dialCode: "+44" },
  { code: "CA", label: "CA", dialCode: "+1" },
  { code: "AU", label: "AU", dialCode: "+61" },
  { code: "IN", label: "IN", dialCode: "+91" },
  { code: "DE", label: "DE", dialCode: "+49" },
  { code: "FR", label: "FR", dialCode: "+33" },
  { code: "JP", label: "JP", dialCode: "+81" },
  { code: "CN", label: "CN", dialCode: "+86" },
  { code: "BR", label: "BR", dialCode: "+55" },
] as const;

// Default values constant to prevent recreation
const DEFAULT_VALUES: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
  privacyPolicy: false,
};

// Separate components for better performance and readability
const NameFields = memo(() => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <FormField
      name="firstName"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-slate-700 font-medium">
            First name
          </FormLabel>
          <FormControl>
            <Input
              placeholder="First name"
              {...field}
              className="h-11 rounded-lg border-slate-200 focus:ring-orange-500 focus:border-orange-500"
              autoComplete="given-name"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      name="lastName"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-slate-700 font-medium">
            Last name
          </FormLabel>
          <FormControl>
            <Input
              placeholder="Last name"
              {...field}
              className="h-11 rounded-lg border-slate-200 focus:ring-orange-500 focus:border-orange-500"
              autoComplete="family-name"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
));

NameFields.displayName = "NameFields";

const EmailField = memo(() => (
  <FormField
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-slate-700 font-medium">Email</FormLabel>
        <FormControl>
          <Input
            type="email"
            placeholder="you@company.com"
            {...field}
            className="h-11 rounded-lg border-slate-200 focus:ring-orange-500 focus:border-orange-500"
            autoComplete="email"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));

EmailField.displayName = "EmailField";

const PhoneField = memo(
  ({
    countryCode,
    onCountryCodeChange,
  }: {
    countryCode: string;
    onCountryCodeChange: (code: string) => void;
  }) => {
    const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);

    return (
      <FormField
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-slate-700 font-medium">
              Phone number
            </FormLabel>
            <div className="flex gap-0">
              <Select value={countryCode} onValueChange={onCountryCodeChange}>
                <SelectTrigger className="w-28 rounded-r-none border-r-0 border-slate-200 bg-white focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.label} {country.dialCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormControl>
                <Input
                  type="tel"
                  placeholder={
                    selectedCountry?.dialCode === "+1"
                      ? "(555) 000-0000"
                      : "000-000-0000"
                  }
                  {...field}
                  className="flex-1 rounded-l-none border-slate-200 focus:ring-orange-500 focus:border-orange-500"
                  autoComplete="tel"
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  },
);

PhoneField.displayName = "PhoneField";

const MessageField = memo(() => (
  <FormField
    name="message"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-slate-700 font-medium">Message</FormLabel>
        <FormControl>
          <Textarea
            placeholder="Leave us a message..."
            {...field}
            className="min-h-[128px] rounded-lg border-slate-200 focus:ring-orange-500 focus:border-orange-500 resize-none"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));

MessageField.displayName = "MessageField";

const PrivacyPolicyField = memo(() => (
  <FormField
    name="privacyPolicy"
    render={({ field }) => (
      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
        <FormControl>
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
            className="mt-1 border-slate-200 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
            aria-label="Accept privacy policy"
          />
        </FormControl>
        <div className="leading-none">
          <FormLabel className="text-slate-600 font-normal cursor-pointer">
            Please check the box to confirm you agree to our{" "}
            <Link
              href="/privacy-policy"
              className="underline hover:text-orange-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              prefetch
            >
              privacy policy.
            </Link>
          </FormLabel>
          {/* <FormMessage /> */}
        </div>
      </FormItem>
    )}
  />
));

PrivacyPolicyField.displayName = "PrivacyPolicyField";

const ContactImage = memo(() => (
  <div className="order-1 lg:order-2 relative h-[400px] md:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl">
    <Image
      src="/images/contact_woman_camera.png"
      alt="Professional woman with camera ready to assist you"
      fill
      className="object-cover"
      priority
      sizes="(max-width: 1024px) 100vw, 50vw"
    />
  </div>
));

ContactImage.displayName = "ContactImage";

export const ContactForm = memo(() => {
  const { mutate, isPending } = useContactMutation();
  const [countryCode, setCountryCode] = useState("US");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onBlur", // Validate on blur for better UX
  });

  const onSubmit = useCallback(
    (values: FormValues) => {
      const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);
      const dialCode = selectedCountry?.dialCode || "+1";

      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: `${dialCode} ${values.phone}`, // Combine country code with phone number
        message: values.message,
      };

      mutate(payload, {
        onSuccess: () => {
          form.reset();
          setCountryCode("US"); // Reset country code to default
        },
      });
    },
    [mutate, form, countryCode],
  );

  return (
    <section
      className="bg-white py-16 md:py-24"
      aria-labelledby="contact-heading"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left side: Form */}
          <div className="order-2 lg:order-1">
            <h2
              id="contact-heading"
              className="text-3xl md:text-4xl font-semibold mb-3 text-slate-900"
            >
              Contact Us
            </h2>
            <p className="text-slate-600 mb-10 text-lg">
              Complete the form below and we&apos;ll respond within 2 business
              days.
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                <NameFields />
                <EmailField />
                <PhoneField
                  countryCode={countryCode}
                  onCountryCodeChange={setCountryCode}
                />
                <MessageField />
                <PrivacyPolicyField />

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#FF8C38] hover:bg-[#e67a29] text-white rounded-lg h-12 text-base font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-busy={isPending}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Sending...
                    </span>
                  ) : (
                    "Send message"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Right side: Image */}
          <ContactImage />
        </div>
      </div>
    </section>
  );
});

ContactForm.displayName = "ContactForm";
