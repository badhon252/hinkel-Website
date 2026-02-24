"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useCallback, useRef } from "react";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

export function useAutoLogout() {
  const { status } = useSession();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (status === "authenticated") {
      timerRef.current = setTimeout(() => {
        // Automatically sign out user on timeout
        signOut({ callbackUrl: "/login" }); // adjust callback url if needed
      }, INACTIVITY_TIMEOUT);
    }
  }, [status]);

  useEffect(() => {
    // Determine active status: we only care if authenticated
    if (status !== "authenticated") return;

    // Set initial timer
    resetTimer();

    const events = [
      "mousemove",
      "keydown",
      "mousedown",
      "touchstart",
      "scroll",
      "wheel",
    ];

    // Throttle the event listeners directly wrapping resetTimer
    // to avoid excessive clearing and resetting
    let isThrottled = false;
    const handleUserActivity = () => {
      if (isThrottled) return;
      isThrottled = true;
      resetTimer();
      setTimeout(() => {
        isThrottled = false;
      }, 1000); // throttle resets to at most once per second
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [status, resetTimer]);
}

export function AutoLogout() {
  useAutoLogout();
  return null;
}
