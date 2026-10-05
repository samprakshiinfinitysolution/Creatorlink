import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorProfile from "@/components/creator/profile/CreatorProfile";

export const metadata = {
  title: "My Profile | CreatorLink",
  description: "Manage your public profile, social links, category tags, and visibility settings.",
};

export default function ProfilePage() {
  return (
    <ReduxProvider>
      <CreatorProfile />
    </ReduxProvider>
  );
}
