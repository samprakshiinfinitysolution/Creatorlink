import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorWorkspaceManager from "@/components/creator/workspace/CreatorWorkspaceManager";

export const metadata = {
  title: "Workspace | CreatorLink",
  description: "View and manage your active brand collaboration workspaces.",
};

export default function CreatorWorkspacePage() {
  return (
    <ReduxProvider>
      <CreatorWorkspaceManager />
    </ReduxProvider>
  );
}
