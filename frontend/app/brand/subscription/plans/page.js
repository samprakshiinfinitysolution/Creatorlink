import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandPlansCheckout from "@/components/brand/subscription/BrandPlansCheckout";

export const metadata = {
  title: "Brand Membership Plans | CreatorLink",
  description: "Select a membership tier to unlock verified creator contacts and scale your influencer marketing campaigns.",
};

export default function BrandPlansCheckoutPage() {
  return (
    <ReduxProvider>
      <BrandPlansCheckout />
    </ReduxProvider>
  );
}

