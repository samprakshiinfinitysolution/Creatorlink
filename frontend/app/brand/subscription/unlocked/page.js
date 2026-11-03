import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandUnlockedCreatorsList from "@/components/brand/subscription/BrandUnlockedCreatorsList";

export const metadata = {
  title: "Unlocked Creators | CreatorLink",
  description: "View and manage direct contact channels for your unlocked creators.",
};

export default function BrandUnlockedCreatorsPage() {
  return (
    <ReduxProvider>
      <BrandUnlockedCreatorsList />
    </ReduxProvider>
  );
}

