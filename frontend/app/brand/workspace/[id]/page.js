import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandWorkspaceDetail from "@/components/brand/workspace/BrandWorkspaceDetail";

export const metadata = {
  title: "Brand Workspace Detail | CreatorLink",
  description: "View workspace details, creator deliverables, and review submitted work.",
};

export default async function BrandWorkspaceDetailPage({ params }) {
  const { id } = await params;

  return (
    <ReduxProvider>
      <BrandWorkspaceDetail workspaceId={id} />
    </ReduxProvider>
  );
}
