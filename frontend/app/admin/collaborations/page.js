import AdminCollaborationsManager from "@/components/admin/collaborations/AdminCollaborationsManager";

export const metadata = {
  title: "Collaboration Monitoring | Admin Portal",
  description: "Real-time oversight over brand-creator workspaces, deliverables progress, submissions, and deadlines."
};

export default function CollaborationsPage() {
  return <AdminCollaborationsManager />;
}
