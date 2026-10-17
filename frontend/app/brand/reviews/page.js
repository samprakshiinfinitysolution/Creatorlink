import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandReviewsManager from "@/components/brand/reviews/BrandReviewsManager";

export const metadata = {
  title: "Brand Reviews & Creator Feedback | CreatorLink",
  description: "Manage and submit performance evaluations and ratings for collaborated creators.",
};

export default function BrandReviewsPage() {
  return (
    <ReduxProvider>
      <BrandReviewsManager />
    </ReduxProvider>
  );
}
