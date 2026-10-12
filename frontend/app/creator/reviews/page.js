import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorReviewsManager from "@/components/creator/reviews/CreatorReviewsManager";

export const metadata = {
  title: "Client Reviews & Reputation | CreatorLink",
  description: "View verified client ratings and feedback received from brand collaborations.",
};

export default function CreatorReviewsPage() {
  return (
    <ReduxProvider>
      <CreatorReviewsManager />
    </ReduxProvider>
  );
}
