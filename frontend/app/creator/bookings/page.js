import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorBookingsManager from "@/components/creator/bookings/CreatorBookingsManager";

export const metadata = {
  title: "Bookings & Proposals | CreatorLink",
  description: "View and manage your collaboration bookings, brand proposals, and campaign applications.",
};

export default function CreatorBookingsPage() {
  return (
    <ReduxProvider>
      <CreatorBookingsManager />
    </ReduxProvider>
  );
}

