import AdminNotificationsManager from "@/components/admin/notifications/AdminNotificationsManager";

export const metadata = {
  title: "Admin Notifications | Admin Portal",
  description: "Monitor platform events, verification requests, moderation alerts, and administrative activity."
};

export default function AdminNotificationsPage() {
  return <AdminNotificationsManager />;
}

