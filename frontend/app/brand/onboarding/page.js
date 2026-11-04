import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandOnboarding from "@/components/brand/onboarding/BrandOnboarding";

export const metadata = {
  title: "Brand Onboarding | CreatorLink",
  description: "Set up your brand profile, company essentials, and socials in 3 quick steps.",
};

export default function BrandOnboardingPage() {
  return (
    <ReduxProvider>
      <BrandOnboarding />
    </ReduxProvider>
  );
}

