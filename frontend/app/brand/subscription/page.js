import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandSubscriptionDashboard from "@/components/brand/subscription/BrandSubscriptionDashboard";

export const metadata = {
  title: "Subscription & Quota | CreatorLink",
  description: "Manage your Brand membership plan, unlock quota, and billing cycles.",
};

export default function BrandSubscriptionPage() {
  return (
    <ReduxProvider>
      <BrandSubscriptionDashboard />
    </ReduxProvider>
  );
}

