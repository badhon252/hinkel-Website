// features/auth/component/login.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useLogin } from "../hooks/uselogin";

const Login = () => {
  const { loading, error, handleLogin } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") || searchParams.get("returnTo") || "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await handleLogin(email, password);
    if (res && !res.error) {
      // Redirect to callback URL (e.g., /create-book) or home
      router.push(callbackUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-6xl bg-white rounded-xl shadow-lg p-10 relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="Company Logo"
              width={120}
              height={120}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>

        {/* Title */}
        <h2 className="text-center text-primary text-2xl font-semibold mb-2">
          Welcome
        </h2>
        <p className="text-center text-sm text-gray-500 mb-8">
          Manage your orders, track shipments, and configure products easily.
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={onSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="hello@example.com"
              className="w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:bg-primary/5 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              className="w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-base mt-2 px-1">
            <label
              htmlFor="remember"
              className="flex items-center gap-2 text-gray-600 cursor-pointer select-none"
            >
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary transition-all cursor-pointer"
              />
              Remember me
            </label>

            <Link
              href={`/reset-password?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              title="reset password"
              className="text-primary font-medium hover:text-primary/80 transition-all hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600 mt-4">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="text-primary font-semibold hover:text-primary/80 transition-all hover:underline"
            >
              Create a Free Account
            </Link>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full mt-6 bg-primary cursor-pointer hover:bg-primary/90 text-white font-semibold py-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
