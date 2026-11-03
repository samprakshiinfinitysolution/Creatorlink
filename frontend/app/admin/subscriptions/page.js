import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import AdminSubscriptionsManager from "@/components/admin/subscriptions/AdminSubscriptionsManager";

export const metadata = {
  title: "Subscription Management | Admin",
  description: "Configure plans, monitor subscribers, and perform audited administrative actions.",
};

export default function AdminSubscriptionsPage() {
  return (
    <ReduxProvider>
      <AdminSubscriptionsManager />
    </ReduxProvider>
  );
}

