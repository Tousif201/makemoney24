import React from "react";
import { useSession } from "../../../context/SessionContext";
import FranchiseRewardsPage from "./FranchiseRewardsPage";
import UsersRewardsPage from "./UsersRewardsPage";
import { Skeleton } from "@/components/ui/skeleton"; // Optional: If you use a Skeleton loader

function RewardsPage() {
  const { session, loading } = useSession();
  console.log(session);
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
  if (session.role === "franchise-admin") {
    return <FranchiseRewardsPage />;
  }
  if (session.role === "user") {
    return <UsersRewardsPage />;
  }
  return <div>index</div>;
}

export default RewardsPage;
