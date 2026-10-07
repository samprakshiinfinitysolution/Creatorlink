import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandBookingsManager from "@/components/brand/bookings/BrandBookingsManager";

export const metadata = {
  title: "Bookings | CreatorLink",
  description: "View and manage your brand campaign bookings and creator applications.",
};

export default function BrandBookingsPage() {
  return (
    <ReduxProvider>
      <BrandBookingsManager />
    </ReduxProvider>
  );
}
