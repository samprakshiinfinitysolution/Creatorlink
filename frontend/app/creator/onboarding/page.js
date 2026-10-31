import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorOnboarding from "@/components/creator/onboarding/CreatorOnboarding";

export const metadata = {
  title: "Creator Onboarding | CreatorLink",
  description: "Set up your creator profile niche, location, and starting rates in 3 quick steps.",
};

export default function CreatorOnboardingPage() {
  return (
    <ReduxProvider>
      <CreatorOnboarding />
    </ReduxProvider>
  );
}

