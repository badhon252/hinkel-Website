"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Mail, RefreshCcw, ShieldCheck } from "lucide-react";
import { useEmailVerification } from "../hooks/useEmailVerification";
import { buildAuthPath } from "../lib/auth-routes";

const OTP_LENGTH = 6;
const DEFAULT_RESEND_SECONDS = 60;

const maskEmail = (email: string) => {
  const [localPart = "", domain = ""] = email.split("@");
  if (!localPart || !domain) return email;

  const visible =
    localPart.length <= 2
      ? `${localPart[0] || ""}*`
      : `${localPart.slice(0, 2)}${"*".repeat(Math.max(1, localPart.length - 2))}`;

  return `${visible}@${domain}`;
};

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") || searchParams.get("returnTo") || "/";
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const [otp, setOtp] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [countdown, setCountdown] = useState(DEFAULT_RESEND_SECONDS);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const {
    verifyEmail,
    resendVerificationEmail,
    isVerifying,
    isResending,
    error,
    successMessage,
  } = useEmailVerification();

  useEffect(() => {
    if (countdown <= 0) return undefined;

    const timeout = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [countdown]);

  const resetCode = () => {
    setOtp(Array.from({ length: OTP_LENGTH }, () => ""));
  };

  const focusInput = (index: number) => {
    const element = document.getElementById(`email-otp-${index}`);
    element?.focus();
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    setLocalMessage(null);

    if (value && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    event.preventDefault();
    const nextOtp = Array.from(
      { length: OTP_LENGTH },
      (_, index) => pasted[index] || "",
    );
    setOtp(nextOtp);

    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    focusInput(nextIndex);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email) {
      setLocalMessage(
        "Your email address is missing. Please start the signup flow again.",
      );
      return;
    }

    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setLocalMessage("Enter the full 6-digit code from your email.");
      return;
    }

    const response = await verifyEmail(email, code);
    if (!response) return;

    resetCode();
    window.setTimeout(() => {
      router.push(
        buildAuthPath({
          callbackUrl,
          email,
          verified: true,
        }),
      );
    }, 1200);
  };

  const handleResend = async () => {
    if (!email || countdown > 0) return;

    const data = await resendVerificationEmail(email);
    if (!data) return;

    setCountdown(data.resendCooldownSeconds || DEFAULT_RESEND_SECONDS);
    resetCode();
  };

  const activeMessage = localMessage || error;
  const maskedEmail = email ? maskEmail(email) : "";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[radial-gradient(circle_at_top,_rgba(245,156,71,0.18),_transparent_38%),linear-gradient(180deg,#fff9f3_0%,#ffffff_65%)]">
      <div className="w-full max-w-2xl rounded-3xl border border-[#f1dcc7] bg-white/95 shadow-[0_24px_80px_rgba(174,91,28,0.12)] overflow-hidden">
        <div className="border-b border-[#f3e1cf] bg-[#fff8f1] px-8 py-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Hinkle"
                width={140}
                height={48}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f59c47]/15 text-[#d96d2d]">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-center text-3xl font-semibold text-[#8f451c]">
            Verify your email
          </h1>
          <p className="mt-3 text-center text-sm leading-6 text-[#735b4a]">
            We sent a 6-digit verification code to{" "}
            <span className="font-semibold text-[#4f3422]">
              {maskedEmail || "your email"}
            </span>
            . Look for a message from{" "}
            <span className="font-semibold text-[#4f3422]">Hinkle</span> and
            enter the code below to activate your free account.
          </p>
        </div>

        <div className="px-8 py-8">
          {!email ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              We couldn&apos;t determine which email address to verify. Please
              return to{" "}
              <Link
                href={buildAuthPath({ mode: "signup", callbackUrl })}
                className="font-semibold underline"
              >
                account creation
              </Link>{" "}
              and try again.
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleVerify}>
              <div className="rounded-2xl border border-[#f2e3d4] bg-[#fffaf6] p-4 text-sm text-[#6a5446]">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-[#d96d2d]" />
                  <div>
                    <p className="font-medium text-[#4f3422]">
                      Check your inbox
                    </p>
                    <p className="mt-1 leading-6">
                      The code expires in about 15 minutes. If you don&apos;t
                      see the email, check your spam or promotions folder, then
                      resend a fresh code below.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Verification code
                </label>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`email-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(event) =>
                        handleChange(event.target.value, index)
                      }
                      onKeyDown={(event) => handleKeyDown(event, index)}
                      onPaste={handlePaste}
                      className="h-14 w-12 rounded-2xl border border-[#e8d2bc] bg-white text-center text-xl font-semibold text-[#4f3422] outline-none transition focus:border-[#f59c47] focus:ring-4 focus:ring-[#f59c47]/15"
                    />
                  ))}
                </div>
              </div>

              {activeMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {activeMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}

              <div className="flex flex-col gap-3 rounded-2xl border border-[#f2e3d4] bg-[#fffaf6] px-4 py-4 text-sm text-[#6a5446] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-[#4f3422]">
                    Didn&apos;t receive the code?
                  </p>
                  <p className="mt-1">
                    {countdown > 0
                      ? `You can request a new code in ${countdown}s.`
                      : "You can request a new verification email now."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || isResending}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#f59c47]/30 px-4 py-2 font-medium text-[#c8642b] transition hover:bg-[#fef1e7] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCcw className="h-4 w-4" />
                  {isResending ? "Resending..." : "Resend code"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isVerifying ? "Verifying..." : "Verify email"}
              </button>

              <p className="text-center text-sm text-gray-500">
                Need to use a different email?{" "}
                <Link
                  href={buildAuthPath({ mode: "signup", callbackUrl })}
                  className="font-semibold text-primary hover:underline"
                >
                  Create another account
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
