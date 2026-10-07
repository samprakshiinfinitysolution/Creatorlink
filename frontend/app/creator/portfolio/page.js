import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorPortfolio from "@/components/creator/portfolio/CreatorPortfolio";

export const metadata = {
  title: "My Portfolio | CreatorLink",
  description: "Showcase your best work and creative projects.",
};

export default function PortfolioPage() {
  return (
    <ReduxProvider>
      <CreatorPortfolio />
    </ReduxProvider>
  );
}
