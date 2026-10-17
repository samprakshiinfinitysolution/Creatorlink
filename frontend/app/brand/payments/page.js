import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandPaymentsManager from "@/components/brand/payments/BrandPaymentsManager";

export const metadata = {
  title: "Brand Payments | CreatorLink",
  description: "Manage Razorpay payments and escrow receipts for completed campaign workspaces.",
};

export default function BrandPaymentsPage() {
  return (
    <ReduxProvider>
      <BrandPaymentsManager />
    </ReduxProvider>
  );
}
