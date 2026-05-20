"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, LockKeyhole, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useLogin } from "../hooks/uselogin";
import { useRegister } from "../hooks/useregister";
import AuthCard from "./AuthCard";
import PasswordInput from "./PasswordInput";
import { AuthMode, buildAuthPath } from "../lib/auth-routes";

type AuthGatewayProps = {
  initialMode?: AuthMode;
};

type SignupErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
};

type LoginErrors = {
  email?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const modeContent: Record<
  AuthMode,
  {
    title: string;
    description: string;
    badge: React.ReactNode;
    // spotlightTitle: string;
    // spotlightBody: string;
    // checklist: string[];
    cta: string;
    alternateLabel: string;
    alternateAction: string;
  }
> = {
  login: {
    title: "Welcome back",
    description:
      "Sign in once and pick up your orders, saved details, and book projects from any device without losing momentum.",
    badge: (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f59c47]/15 text-[#d96d2d]">
        <LockKeyhole className="h-6 w-6" />
      </div>
    ),
    // spotlightTitle: "Designed for returning customers",
    // spotlightBody:
    //   "Get to active orders quickly, track updates, and continue where you left off.",
    // checklist: [
    //   "Fast sign-in with preserved callback redirects",
    //   "Inline validation before submit",
    //   "Password visibility toggle for fewer typing mistakes",
    // ],
    cta: "Log In",
    alternateLabel: "New to sktchlabs.com?",
    alternateAction: "Create account",
  },
  signup: {
    title: "Create your account",
    description:
      "Set up your account in one place, verify your email, and start managing orders with a simpler first-time flow.",
    badge: (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f59c47]/15 text-[#d96d2d]">
        <UserPlus className="h-6 w-6" />
      </div>
    ),
    // spotlightTitle: "Built for first-time users",
    // spotlightBody:
    //   "Everything you need is in one screen, with clear guidance and minimal friction from start to finish.",
    // checklist: [
    //   "Create account and confirm password in one step",
    //   "Clear inline guidance for validation issues",
    //   "Responsive layout that feels natural on mobile",
    // ],
    cta: "Create Account",
    alternateLabel: "Already have an account?",
    alternateAction: "Log in instead",
  },
};

const getModeFromQuery = (value: string | null): AuthMode =>
  value === "signup" ? "signup" : "login";

const getFriendlyName = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const AuthGateway = ({ initialMode = "login" }: AuthGatewayProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") || searchParams.get("returnTo") || "/";
  const verified = searchParams.get("verified");
  const emailFromQuery = searchParams.get("email") || "";
  const searchMode = getModeFromQuery(searchParams.get("mode"));

  const {
    loading: loginLoading,
    error: loginApiError,
    handleLogin,
  } = useLogin();
  const {
    loading: signupLoading,
    error: signupApiError,
    handleRegister,
  } = useRegister();

  const hasModeQuery = searchParams.get("mode") !== null;
  const mode: AuthMode =
    pathname === "/register"
      ? "signup"
      : hasModeQuery
        ? searchMode
        : initialMode === "signup"
          ? "signup"
          : "login";
  const [loginEmail, setLoginEmail] = useState(emailFromQuery);
  const [loginPassword, setLoginPassword] = useState("");
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: emailFromQuery,
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});
  const [signupErrors, setSignupErrors] = useState<SignupErrors>({});

  useEffect(() => {
    if (pathname === "/register") {
      router.replace(
        buildAuthPath({
          mode: "signup",
          callbackUrl,
          email: emailFromQuery || undefined,
        }),
      );
    }
  }, [callbackUrl, emailFromQuery, pathname, router]);

  const switchMode = (nextMode: AuthMode) => {
    setLoginErrors({});
    setSignupErrors({});

    router.replace(
      buildAuthPath({
        mode: nextMode,
        callbackUrl,
        email: nextMode === "login" ? loginEmail || emailFromQuery : undefined,
        verified: nextMode === "login" && verified === "1",
      }),
    );
  };

  const content = modeContent[mode];

  const validateLogin = () => {
    const nextErrors: LoginErrors = {};

    if (!loginEmail.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!emailPattern.test(loginEmail.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!loginPassword) {
      nextErrors.password = "Password is required.";
    }

    setLoginErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateSignup = () => {
    const nextErrors: SignupErrors = {};

    if (!signupData.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!signupData.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!signupData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!emailPattern.test(signupData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!signupData.password) {
      nextErrors.password = "Password is required.";
    } else if (signupData.password.length < 6) {
      nextErrors.password = "Use at least 6 characters.";
    }

    if (!signupData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (signupData.confirmPassword !== signupData.password) {
      nextErrors.confirmPassword =
        "Passwords do not match. Please re-enter them.";
    }

    if (!signupData.termsAccepted) {
      nextErrors.terms = "You need to agree to the Privacy Policy.";
    }

    setSignupErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateLogin()) return;

    const response = await handleLogin(loginEmail.trim(), loginPassword);

    if (response?.success) {
      router.push(callbackUrl);
      return;
    }

    if (response?.verification) {
      router.push(
        `/verify-email?email=${encodeURIComponent(response.verification.email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
      );
    }
  };

  const handleSignupSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateSignup()) return;

    const fullName = `${getFriendlyName(signupData.firstName.trim())} ${getFriendlyName(signupData.lastName.trim())}`;
    const response = await handleRegister(
      fullName,
      signupData.email.trim(),
      signupData.password,
    );

    if (response?.status && response.data?.email) {
      toast.success(
        response.message || "Account created. Please verify your email.",
      );
      router.push(
        `/verify-email?email=${encodeURIComponent(response.data.email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
      );
    }
  };

  const authBanner = useMemo(() => {
    if (mode === "login" && verified === "1") {
      return {
        tone: "success" as const,
        message: "Your email has been verified. You can sign in now.",
      };
    }

    if (mode === "login" && loginApiError) {
      return {
        tone: "error" as const,
        message: loginApiError,
      };
    }

    if (mode === "signup" && signupApiError) {
      return {
        tone: "error" as const,
        message: signupApiError,
      };
    }

    return null;
  }, [loginApiError, mode, signupApiError, verified]);

  return (
    <AuthCard
      title={content.title}
      description={content.description}
      badge={content.badge}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-2 rounded-[22px] border border-[#f1dfcf] bg-[#fff8f2] p-2">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition sm:text-base ${
              mode === "login"
                ? "bg-white text-[#8f451c] shadow-[0_10px_24px_rgba(174,91,28,0.12)]"
                : "text-[#8f6a54] hover:bg-white/70"
            }`}
            aria-pressed={mode === "login"}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition sm:text-base ${
              mode === "signup"
                ? "bg-white text-[#8f451c] shadow-[0_10px_24px_rgba(174,91,28,0.12)]"
                : "text-[#8f6a54] hover:bg-white/70"
            }`}
            aria-pressed={mode === "signup"}
          >
            Create Account
          </button>
        </div>

        {/* <div className="rounded-[24px] border border-[#f2e3d4] bg-[linear-gradient(180deg,#fffdfa_0%,#fff6ee_100%)] p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-2xl bg-[#f59c47]/15 p-2.5 text-[#d96d2d]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#4f3422]">
                {content.spotlightTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#6a5446]">
                {content.spotlightBody}
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-[#735b4a]">
            {content.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div> */}

        {authBanner ? (
          <div
            className={`rounded-2xl border p-4 text-sm ${
              authBanner.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {authBanner.message}
          </div>
        ) : null}

        <div
          key={mode}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {mode === "login" ? (
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium tracking-[0.01em] text-[#4f3422]"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="hello@example.com"
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-[#4f3422] shadow-[0_1px_2px_rgba(79,52,34,0.04)] transition placeholder:text-[#b59a88] focus:border-[#f59c47] focus:bg-[#fffdfb] focus:outline-none focus:ring-4 focus:ring-[#f59c47]/15 ${
                    loginErrors.email ? "border-red-300" : "border-[#e8d6c5]"
                  }`}
                  value={loginEmail}
                  onChange={(event) => {
                    setLoginEmail(event.target.value);
                    setLoginErrors((current) => ({
                      ...current,
                      email: undefined,
                    }));
                  }}
                  required
                />
                {loginErrors.email ? (
                  <p className="text-sm text-red-600">{loginErrors.email}</p>
                ) : null}
              </div>

              <PasswordInput
                id="login-password"
                label="Password"
                value={loginPassword}
                onChange={(value) => {
                  setLoginPassword(value);
                  setLoginErrors((current) => ({
                    ...current,
                    password: undefined,
                  }));
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                error={loginErrors.password}
                required
              />

              <div className="flex flex-col gap-4 rounded-2xl border border-[#f2e3d4] bg-[#fffdfa] px-4 py-4 text-sm text-[#6a5446] sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor="remember"
                  className="flex cursor-pointer items-center gap-3 select-none"
                >
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-primary transition-all"
                  />
                  Remember me
                </label>

                <Link
                  href={`/reset-password?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  title="reset password"
                  className="font-medium text-primary transition-all hover:text-primary/80 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-primary px-4 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(245,140,54,0.26)] transition hover:bg-primary/90 hover:shadow-[0_20px_48px_rgba(245,140,54,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loginLoading}
              >
                {loginLoading ? "Logging in..." : content.cta}
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleSignupSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="signup-first-name"
                    className="text-sm font-medium tracking-[0.01em] text-[#4f3422]"
                  >
                    First Name
                  </label>
                  <input
                    id="signup-first-name"
                    type="text"
                    placeholder="John"
                    className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-[#4f3422] shadow-[0_1px_2px_rgba(79,52,34,0.04)] transition placeholder:text-[#b59a88] focus:border-[#f59c47] focus:bg-[#fffdfb] focus:outline-none focus:ring-4 focus:ring-[#f59c47]/15 ${
                      signupErrors.firstName
                        ? "border-red-300"
                        : "border-[#e8d6c5]"
                    }`}
                    value={signupData.firstName}
                    onChange={(event) => {
                      setSignupData((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }));
                      setSignupErrors((current) => ({
                        ...current,
                        firstName: undefined,
                      }));
                    }}
                    required
                  />
                  {signupErrors.firstName ? (
                    <p className="text-sm text-red-600">
                      {signupErrors.firstName}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="signup-last-name"
                    className="text-sm font-medium tracking-[0.01em] text-[#4f3422]"
                  >
                    Last Name
                  </label>
                  <input
                    id="signup-last-name"
                    type="text"
                    placeholder="Doe"
                    className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-[#4f3422] shadow-[0_1px_2px_rgba(79,52,34,0.04)] transition placeholder:text-[#b59a88] focus:border-[#f59c47] focus:bg-[#fffdfb] focus:outline-none focus:ring-4 focus:ring-[#f59c47]/15 ${
                      signupErrors.lastName
                        ? "border-red-300"
                        : "border-[#e8d6c5]"
                    }`}
                    value={signupData.lastName}
                    onChange={(event) => {
                      setSignupData((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }));
                      setSignupErrors((current) => ({
                        ...current,
                        lastName: undefined,
                      }));
                    }}
                    required
                  />
                  {signupErrors.lastName ? (
                    <p className="text-sm text-red-600">
                      {signupErrors.lastName}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="signup-email"
                  className="block text-sm font-medium tracking-[0.01em] text-[#4f3422]"
                >
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="hello@example.com"
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-[#4f3422] shadow-[0_1px_2px_rgba(79,52,34,0.04)] transition placeholder:text-[#b59a88] focus:border-[#f59c47] focus:bg-[#fffdfb] focus:outline-none focus:ring-4 focus:ring-[#f59c47]/15 ${
                    signupErrors.email ? "border-red-300" : "border-[#e8d6c5]"
                  }`}
                  value={signupData.email}
                  onChange={(event) => {
                    setSignupData((current) => ({
                      ...current,
                      email: event.target.value,
                    }));
                    setSignupErrors((current) => ({
                      ...current,
                      email: undefined,
                    }));
                  }}
                  required
                />
                {signupErrors.email ? (
                  <p className="text-sm text-red-600">{signupErrors.email}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PasswordInput
                  id="signup-password"
                  label="Password"
                  value={signupData.password}
                  onChange={(value) => {
                    setSignupData((current) => ({
                      ...current,
                      password: value,
                    }));
                    setSignupErrors((current) => ({
                      ...current,
                      password: undefined,
                    }));
                  }}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  helperText="Use at least 6 characters."
                  error={signupErrors.password}
                  required
                />

                <PasswordInput
                  id="signup-confirm-password"
                  label="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={(value) => {
                    setSignupData((current) => ({
                      ...current,
                      confirmPassword: value,
                    }));
                    setSignupErrors((current) => ({
                      ...current,
                      confirmPassword: undefined,
                    }));
                  }}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  error={signupErrors.confirmPassword}
                  required
                />
              </div>

              <div className="rounded-2xl border border-[#f2e3d4] bg-[#fffdfa] px-4 py-4 text-sm text-[#6a5446]">
                <label
                  htmlFor="signup-terms"
                  className="flex cursor-pointer items-start gap-3 select-none"
                >
                  <input
                    id="signup-terms"
                    type="checkbox"
                    checked={signupData.termsAccepted}
                    onChange={(event) => {
                      setSignupData((current) => ({
                        ...current,
                        termsAccepted: event.target.checked,
                      }));
                      setSignupErrors((current) => ({
                        ...current,
                        terms: undefined,
                      }));
                    }}
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 accent-primary transition-all"
                    required
                  />
                  <span className="leading-6">
                    I agree to the{" "}
                    <Link
                      href="/privacy-policy"
                      className="font-medium text-primary transition-all hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {signupErrors.terms ? (
                  <p className="mt-3 text-sm text-red-600">
                    {signupErrors.terms}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-primary px-4 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(245,140,54,0.26)] transition hover:bg-primary/90 hover:shadow-[0_20px_48px_rgba(245,140,54,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={signupLoading}
              >
                {signupLoading ? "Creating account..." : content.cta}
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-[#fff7ef] px-4 py-4 text-sm text-[#6a5446] sm:flex-row sm:items-center sm:justify-between">
          <span>{content.alternateLabel}</span>
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            className="inline-flex items-center gap-2 font-semibold text-primary transition hover:text-primary/80"
          >
            {content.alternateAction}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AuthCard>
  );
};

export default AuthGateway;
