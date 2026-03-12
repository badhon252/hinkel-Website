"use client";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { NewsletterSection } from "@/features/newsletter/components/NewsletterSection";
import {
  ShieldCheck,
  CreditCard,
  Database,
  Cloud,
  Lock,
  CheckCircle2,
  LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useCategoryHeader } from "@/features/category-page/hooks/use-categoryheader";
import { useContent } from "@/features/category-page/hooks/use-content";
import type { CategoryContent } from "@/features/category-page/types";

// Extract link data to reduce repetition and improve maintainability
const FOOTER_LINKS = {
  styles: [
    { label: "Kids", href: "/category/kids" },
    { label: "Seniors", href: "/category/seniors" },
    { label: "Adults", href: "/category/adults" },
    { label: "Pets", href: "/category/pets" },
  ],
  resources: [
    { label: "Contact", href: "/contact-us" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about-us" },
    { label: "Terms of Conditions", href: "/terms-conditions" },
    { label: "Refund Policy", href: "/refund" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
  // legal: [
  //   { label: "Privacy Policy", href: "/privacy-policy" },
  //   { label: "Refund Policy", href: "/refund" },
  //   // { label: "Cookies", href: "/cookies" },
  // ],
} as const;

// Extracted sub-components for better code splitting and reusability
const FooterLinkSection = memo(
  ({
    title,
    links,
  }: {
    title: string;
    links: readonly { label: string; href: string }[];
  }) => (
    <div className="md:col-span-2">
      <h3 className="text-primary-foreground font-semibold mb-6">{title}</h3>
      <nav aria-label={`${title} links`}>
        <ul className="space-y-4">
          {links.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-primary-foreground hover:text-primary hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  ),
);

FooterLinkSection.displayName = "FooterLinkSection";

const TrustSeal = ({
  icon: Icon,
  label,
  detail,
  color,
  delay = 0,
}: {
  icon: LucideIcon;
  label: string;
  detail: string;
  color: string;
  delay?: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const { data: usePostCategoryHeader } = useCategoryHeader();
  console.log(usePostCategoryHeader, "categoryHeader");
  return (
    <div
      className="relative flex flex-col items-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
        className="relative cursor-help"
      >
        <div
          className={`relative z-10 p-5 rounded-full bg-white shadow-xl transition-transform duration-300 group-hover:scale-110 ${color}`}
        >
          <Icon className="w-7 h-7" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5"
          >
            <CheckCircle2 className="w-3 h-3" />
          </motion.div>
        </div>
        {/* Animated outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/30 animate-[spin_10s_linear_infinite]" />
      </motion.div>

      <span className="mt-3 text-xs font-bold text-blue-100 uppercase tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">
        {label}
      </span>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-4 z-50 w-64 p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-xl"
          >
            <div className="text-white text-xs leading-relaxed font-medium">
              <span className="block text-blue-400 font-bold mb-1 uppercase tracking-widest text-[10px]">
                Security Verified
              </span>
              {detail}
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b border-slate-700 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Footer = () => {
  // const currentYear = new Date().getFullYear();
  const { data: contentData } = useContent({ limit: 12 });

  let styleLinks: readonly { label: string; href: string }[] =
    FOOTER_LINKS.styles;

  if (contentData?.data && contentData.data.length > 0) {
    const dynamicLinks: { label: string; href: string }[] = contentData.data
      .filter((c: CategoryContent) => c.type?.toLowerCase() !== "home")
      .map((c: CategoryContent) => ({
        label: c.type ? c.type.charAt(0).toUpperCase() + c.type.slice(1) : "",
        href: `/category/${c.type}`,
      }));

    const uniqueLinks = Array.from(
      new Map(dynamicLinks.map((item) => [item.href, item])).values(),
    );

    if (uniqueLinks.length > 0) {
      styleLinks = uniqueLinks;
    }
  }

  return (
    <footer
      className="w-full bg-blue-100 pt-16 pb-8 border-t border-gray-100"
      role="contentinfo"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Logo and Description */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link
              href="/"
              className="inline-block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              <Image
                src="/images/logo.png"
                alt="Company Logo"
                width={250}
                height={40}
                className="mb-8"
                priority={false}
                loading="lazy"
              />
            </Link>
            {/* <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
              Design amazing digital experiences that create more happy in the
              world.
            </p> */}
          </div>

          {/* Category styles Links */}
          <FooterLinkSection title="Collections" links={styleLinks} />

          {/* Resources Links */}
          <FooterLinkSection
            title="Quick Links"
            links={FOOTER_LINKS.resources}
          />

          {/* Subscribe Section */}
          <NewsletterSection />
        </div>

        {/* Official Verified Security Banner */}
        <div className="mt-16 overflow-hidden rounded-3xl bg-[#0a1128d0] border border-blue-900/50 shadow-2xl relative">
          {/* Subtle Background Glows */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />

          <div className="px-8 pt-14 pb-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/40">
                  <Lock className="w-5 h-5 text-blue-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-white font-bold tracking-tight text-lg">
                    Trust & Security Verified
                  </h4>
                  <p className="text-blue-200/50 text-[10px] uppercase tracking-[0.2em] font-medium">
                    Official Platform Protection
                  </p>
                </div>
              </div>
              <div className="h-px flex-1 bg-linear-to-r from-blue-500/40 to-transparent hidden md:block" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              <TrustSeal
                icon={ShieldCheck}
                label="SSL Encryption"
                detail="Industry-standard TLS/SSL encryption for all data transport safely."
                color="text-blue-600"
                delay={0.1}
              />
              <TrustSeal
                icon={CreditCard}
                label="Stripe Secure"
                detail="PCI-DSS Level 1 certified payments. No sensitive card data is ever stored on our servers."
                color="text-slate-800"
                delay={0.2}
              />
              <TrustSeal
                icon={Database}
                label="MongoDB Atlas"
                detail="ISO 27001 & SOC 2 Type II compliant infrastructure. Enterprise-grade data protection."
                color="text-emerald-600"
                delay={0.3}
              />
              <TrustSeal
                icon={Cloud}
                label="Cloudinary Cloud"
                detail="SOC 2 Type II compliant media hosting. Intelligent and secure asset storage."
                color="text-sky-600"
                delay={0.4}
              />
            </div>
          </div>

          <div className="bg-white/3 border-t border-white/5 px-8 py-4">
            <p className="text-center text-blue-200/40 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-semibold">
              Security Stack: Stripe • MongoDB • Cloudinary • SSL/TLS Trusted
              Infrastructure
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-gray-400 text-sm">
            ©sktchLABS: Illustrating your world, one page at a time.
          </p>
          {/* <nav aria-label="Legal links">
            <ul className="flex gap-8">
              {FOOTER_LINKS.legal.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-gray-400 hover:text-gray-600 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav> */}
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
