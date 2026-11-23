import { Suspense } from "react";
import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorSettingsManager from "@/components/creator/settings/CreatorSettingsManager";

export const metadata = {
  title: "Creator Settings | CreatorLink",
  description: "Manage your creator account settings, security, and preferences.",
};

export default function CreatorSettingsPage() {
  return (
    <ReduxProvider>
      <Suspense fallback={null}>
        <CreatorSettingsManager />
      </Suspense>
    </ReduxProvider>
  );
}
