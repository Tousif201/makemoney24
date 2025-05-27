import { Skeleton } from "@/components/ui/skeleton"; // Optional: If you use a Skeleton loader
import { useSession } from "../../../context/SessionContext";
import UserProfile from "./UserProfile";
import VendorProfile from "./VendorProfile";

function ProfilePage() {
  const { session, loading } = useSession();

  if (loading) {
    // Show loading state
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    );
  }

  if (!session?.role) {
    // Handle no session or unknown role
    return (
      <div className="p-6 text-center text-gray-500">
        You are not authorized to view this page.
      </div>
    );
  }

  if (session.role === "user") {
    return <UserProfile />;
  }

  if (session.role === "vendor") {
    return <VendorProfile />;
  }

  return (
    <div className="p-6 text-center text-gray-500">
      Invalid role. Please contact support.
    </div>
  );
}

export default ProfilePage;
