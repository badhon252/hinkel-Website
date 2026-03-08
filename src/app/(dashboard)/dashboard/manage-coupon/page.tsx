import ManageCouponPage from "@/components/dashboard/pages/manage-coupon/ManageCouponPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Coupons | Hinkle Creek",
  description: "Manage your promotional coupons and discounts.",
};

export default function Page() {
  return <ManageCouponPage />;
}
