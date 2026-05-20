"use client";

import { useState } from "react";
import AuthCard from "@/features/auth/component/AuthCard";
import PasswordInput from "@/features/auth/component/PasswordInput";
import { UserPlus } from "lucide-react";

export default function Page() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match. Please re-enter them.");
      return;
    }

    setPasswordError("");
  };

  return (
    <AuthCard
      title="Create your account"
      description="Set up your profile details and choose a secure password you can easily review while typing."
      badge={
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f59c47]/15 text-[#d96d2d]">
          <UserPlus className="h-6 w-6" />
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium tracking-[0.01em] text-[#4f3422]">
              First Name
            </label>
            <input
              type="text"
              placeholder="Lorem"
              className="w-full rounded-2xl border border-[#e8d6c5] bg-white px-4 py-3.5 text-sm text-[#4f3422] shadow-[0_1px_2px_rgba(79,52,34,0.04)] transition placeholder:text-[#b59a88] focus:border-[#f59c47] focus:bg-[#fffdfb] focus:outline-none focus:ring-4 focus:ring-[#f59c47]/15"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium tracking-[0.01em] text-[#4f3422]">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Ipsum"
              className="w-full rounded-2xl border border-[#e8d6c5] bg-white px-4 py-3.5 text-sm text-[#4f3422] shadow-[0_1px_2px_rgba(79,52,34,0.04)] transition placeholder:text-[#b59a88] focus:border-[#f59c47] focus:bg-[#fffdfb] focus:outline-none focus:ring-4 focus:ring-[#f59c47]/15"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium tracking-[0.01em] text-[#4f3422]">
            Email Address
          </label>
          <input
            type="email"
            placeholder="hello@example.com"
            className="w-full rounded-2xl border border-[#e8d6c5] bg-white px-4 py-3.5 text-sm text-[#4f3422] shadow-[0_1px_2px_rgba(79,52,34,0.04)] transition placeholder:text-[#b59a88] focus:border-[#f59c47] focus:bg-[#fffdfb] focus:outline-none focus:ring-4 focus:ring-[#f59c47]/15"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PasswordInput
            label="Password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              if (passwordError && value === confirmPassword) {
                setPasswordError("");
              }
            }}
            placeholder="Create a password"
            autoComplete="new-password"
            helperText="Use at least 6 characters."
            required
          />
          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              if (passwordError && value === password) {
                setPasswordError("");
              }
            }}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={passwordError}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-primary px-4 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(245,140,54,0.26)] transition hover:bg-primary/90 hover:shadow-[0_20px_48px_rgba(245,140,54,0.3)]"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-[#6a5446]">
          Already have an account?{" "}
          <a href="#" className="font-medium text-primary hover:underline">
            Sign In
          </a>
        </p>
      </form>
    </AuthCard>
  );
}
