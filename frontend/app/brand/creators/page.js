import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandCreatorsManager from "@/components/brand/creators/BrandCreatorsManager";

export const metadata = {
  title: "Discover Creators | CreatorLink",
  description: "Discover, filter, and collaborate with top verified creators.",
};

export default function BrandCreatorsPage() {
  return (
    <ReduxProvider>
      <BrandCreatorsManager />
    </ReduxProvider>
  );
}
