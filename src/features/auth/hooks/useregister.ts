"use client";
import { useState } from "react";
import { registeruser } from "../api/register.api";

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return null;
};

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const normalizedFirstName = firstName.trim();
      const normalizedLastName = lastName.trim();
      const result = await registeruser({
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        name: [normalizedFirstName, normalizedLastName]
          .filter(Boolean)
          .join(" "),
        email: email.trim().toLowerCase(),
        password,
      });

      return result;
    } catch (err: unknown) {
      const message = getErrorMessage(err) || "An unexpected error occurred";
      const normalizedEmail = email.trim().toLowerCase();

      if (/already registered|already exists|duplicate/i.test(message)) {
        setError(
          `An account with ${normalizedEmail} already exists. Try logging in instead.`,
        );
      } else {
        setError(message);
      }

      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleRegister };
}
