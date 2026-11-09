
import { Suspense } from "react";
import AdminVerificationQueue from "@/components/admin/verification/AdminVerificationQueue";

export const metadata = {
  title: "Verification Management | Admin | CreatorLink",
  description: "Review creator and brand identity documents and grant verification badges."
};

export default function VerificationPage() {
  return (
    <Suspense fallback={null}>
      <AdminVerificationQueue />
    </Suspense>
  );
}
