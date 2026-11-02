import AdminCampaignsManager from "@/components/admin/campaigns/AdminCampaignsManager";

export const metadata = {
  title: "Campaign Moderation | Admin Portal",
  description: "Monitor, audit, and moderate influencer marketing campaigns on CreatorLink."
};

export default function CampaignsPage() {
  return <AdminCampaignsManager />;
}
