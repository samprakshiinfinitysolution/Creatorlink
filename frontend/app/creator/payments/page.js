import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorPaymentsManager from "@/components/creator/payments/CreatorPaymentsManager";

export const metadata = {
  title: "Received Payments & Earnings | CreatorLink",
  description: "View verified Razorpay payments and escrow receipts for your campaign collaborations.",
};

export default function CreatorPaymentsPage() {
  return (
    <ReduxProvider>
      <CreatorPaymentsManager />
    </ReduxProvider>
  );
}
