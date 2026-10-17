import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorDiscoverCampaignsManager from "@/components/creator/campaigns/CreatorDiscoverCampaignsManager";

export const metadata = {
  title: "Discover Campaigns | CreatorLink",
  description: "Explore active brand campaign opportunities and collaborate with leading brands.",
};

export default function DiscoverCampaignsPage() {
  return (
    <ReduxProvider>
      <CreatorDiscoverCampaignsManager />
    </ReduxProvider>
  );
}
