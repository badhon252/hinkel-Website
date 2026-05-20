"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { LoginVerificationRequiredData } from "../types";
import {
  clearRecentEmailVerification,
  wasEmailRecentlyVerified,
} from "../lib/recent-email-verification";

type LoginActionResult =
  | { success: true }
  | {
      success: false;
      message: string;
      verification?: LoginVerificationRequiredData;
      verificationPending?: boolean;
    };

const parseAuthError = (error: string) => {
  try {
    return JSON.parse(error) as {
      status?: number;
      message?: string;
      data?: LoginVerificationRequiredData | null;
    };
  } catch {
    return null;
  }
};

const RETRY_DELAYS_MS = [800, 1500, 2500];

const wait = (durationMs: number) =>
  new Promise((resolve) => window.setTimeout(resolve, durationMs));

const shouldRetryRecentlyVerifiedLogin = (
  email: string,
  verificationData?: LoginVerificationRequiredData,
) => {
  if (!verificationData?.verificationRequired) {
    return false;
  }

  const verificationEmail = verificationData.email?.trim().toLowerCase();
  const submittedEmail = email.trim().toLowerCase();

  if (!verificationEmail || verificationEmail !== submittedEmail) {
    return false;
  }

  return wasEmailRecentlyVerified(submittedEmail);
};

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      let result = await signIn("credentials", {
        redirect: false,
        email: normalizedEmail,
        password,
      });

      if (result?.error) {
        let parsed = parseAuthError(result.error);

        if (
          shouldRetryRecentlyVerifiedLogin(
            normalizedEmail,
            parsed?.data || undefined,
          )
        ) {
          for (const delayMs of RETRY_DELAYS_MS) {
            await wait(delayMs);
            result = await signIn("credentials", {
              redirect: false,
              email: normalizedEmail,
              password,
            });

            if (!result?.error) {
              break;
            }

            parsed = parseAuthError(result.error);

            if (
              !shouldRetryRecentlyVerifiedLogin(
                normalizedEmail,
                parsed?.data || undefined,
              )
            ) {
              break;
            }
          }
        }
      }

      if (result?.error) {
        const parsed = parseAuthError(result.error);
        const message = parsed?.message || result.error;

        if (
          shouldRetryRecentlyVerifiedLogin(
            normalizedEmail,
            parsed?.data || undefined,
          )
        ) {
          const retryMessage =
            "Your email was verified successfully. We're syncing your account now, so please try signing in again in a few seconds.";
          setError(retryMessage);
          return {
            success: false,
            message: retryMessage,
            verificationPending: true,
          } satisfies LoginActionResult;
        }

        setError(message);

        if (parsed?.data?.verificationRequired) {
          return {
            success: false,
            message,
            verification: parsed.data,
          } satisfies LoginActionResult;
        }

        return {
          success: false,
          message,
        } satisfies LoginActionResult;
      }

      clearRecentEmailVerification(normalizedEmail);
      return { success: true } satisfies LoginActionResult;
    } catch {
      setError("Something went wrong");
      return {
        success: false,
        message: "Something went wrong",
      } satisfies LoginActionResult;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleLogin };
}
