import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorServices from "@/components/creator/services/CreatorServices";

export const metadata = {
  title: "My Services | CreatorLink",
  description: "Manage your service packages, pricing, and deliverables.",
};

export default function ServicesPage() {
  return (
    <ReduxProvider>
      <CreatorServices />
    </ReduxProvider>
  );
}
