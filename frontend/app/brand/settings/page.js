import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandSettingsManager from "@/components/brand/settings/BrandSettingsManager";

export const metadata = {
  title: "Brand Settings | CreatorLink",
  description: "Manage your brand account settings, security, and notification preferences.",
};

export default function BrandSettingsPage() {
  return (
    <ReduxProvider>
      <BrandSettingsManager />
    </ReduxProvider>
  );
}
