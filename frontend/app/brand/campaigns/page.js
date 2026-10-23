import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandCampaignsManager from "@/components/brand/campaigns/BrandCampaignsManager";

export default function BrandCampaignsPage() {
  return (
    <ReduxProvider>
      <BrandCampaignsManager />
    </ReduxProvider>
  );
}
