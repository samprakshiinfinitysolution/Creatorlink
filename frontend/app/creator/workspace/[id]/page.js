import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorWorkspaceDetail from "@/components/creator/workspace/CreatorWorkspaceDetail";

export const metadata = {
  title: "Workspace Details | CreatorLink",
  description: "View collaboration workspace details, submit campaign deliverables, and track review status.",
};

export default async function CreatorWorkspaceDetailPage({ params }) {
  const { id } = await params;

  return (
    <ReduxProvider>
      <CreatorWorkspaceDetail workspaceId={id} />
    </ReduxProvider>
  );
}
