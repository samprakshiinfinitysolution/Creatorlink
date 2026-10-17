import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorNotificationsManager from "@/components/creator/notifications/CreatorNotificationsManager";

export const metadata = {
  title: "Notifications | CreatorLink Creator",
  description: "View and manage your creator notifications, campaign invites, and payment updates.",
};

export default function CreatorNotificationsPage() {
  return (
    <ReduxProvider>
      <CreatorNotificationsManager />
    </ReduxProvider>
  );
}
