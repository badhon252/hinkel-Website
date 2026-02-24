// src/ap/Providers/providers.tsx

"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { AutoLogout } from "@/hooks/useAutoLogout";

export default function Provider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AutoLogout />
      {children}
    </SessionProvider>
  );
}
