import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorAppliedCampaignsManager from "@/components/creator/campaigns/CreatorAppliedCampaignsManager";

export const metadata = {
  title: "My Campaigns | CreatorLink",
  description: "View and manage your applied campaigns and active brand collaborations.",
};

export default function CreatorAppliedCampaignsPage() {
  return (
    <ReduxProvider>
      <CreatorAppliedCampaignsManager />
    </ReduxProvider>
  );
}
