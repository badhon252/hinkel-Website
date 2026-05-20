import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Access",
  description:
    "Log in or create your Hinkle account from a single streamlined entry point.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-secondary">{children}</div>;
}
