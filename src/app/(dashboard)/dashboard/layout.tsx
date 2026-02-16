import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/common/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard | Hinkle Creek",
  description: "Manage your books, categories, and site content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardShell>{children}</DashboardShell>;
}
