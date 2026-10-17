import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorCampaignDetail from "@/components/creator/campaigns/CreatorCampaignDetail";

export const metadata = {
  title: "Campaign Details | CreatorLink",
  description: "View detailed information about this campaign.",
};

export default async function CreatorCampaignDetailPage({ params }) {
  const { id } = await params;

  return (
    <ReduxProvider>
      <CreatorCampaignDetail campaignId={id} />
    </ReduxProvider>
  );
}
