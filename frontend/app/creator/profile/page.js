import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorProfile from "@/components/creator/profile/CreatorProfile";

export default function CreatorProfilePage() {
  return (
    <ReduxProvider>
      <CreatorProfile />
    </ReduxProvider>
  );
}
