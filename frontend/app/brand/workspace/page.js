import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandWorkspaceManager from "@/components/brand/workspace/BrandWorkspaceManager";

export const metadata = {
  title: "Workspace | CreatorLink",
  description: "View and manage active creator collaboration workspaces.",
};

export default function BrandWorkspacePage() {
  return (
    <ReduxProvider>
      <BrandWorkspaceManager />
    </ReduxProvider>
  );
}
