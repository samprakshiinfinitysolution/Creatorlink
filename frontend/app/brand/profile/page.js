import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandProfileForm from "@/components/brand/profile/BrandProfileForm";

export default function BrandProfilePage() {
  return (
    <ReduxProvider>
      <BrandProfileForm />
    </ReduxProvider>
  );
}
