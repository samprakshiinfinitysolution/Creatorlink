import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandNotificationsManager from "@/components/brand/notifications/BrandNotificationsManager";

export const metadata = {
  title: "Notifications | CreatorLink Brand",
  description: "View and manage your brand notifications, campaign proposals, and workspace updates.",
};

export default function BrandNotificationsPage() {
  return (
    <ReduxProvider>
      <BrandNotificationsManager />
    </ReduxProvider>
  );
}
