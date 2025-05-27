import React from "react";
import { useSession } from "../../hooks/useSession";

function DashboardHome() {
  const { user, session, loading } = useSession();

  if (loading) {
    return <div>Loading session...</div>;
  }

  if (!user) {
    return <div>Session expired or user not found.</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name || "User"}!</h1>

      {/* Role-based dashboard views */}
      {user.roles?.includes("admin") && (
        <div>Admin Dashboard: Manage users, reports, and system settings.</div>
      )}

      {user.roles?.includes("vendor") && (
        <div>Vendor Dashboard: Manage your products, orders, and revenue.</div>
      )}

      {user.roles?.includes("user") && (
        <div>
          User Dashboard: Browse services, view orders, and manage your profile.
        </div>
      )}

      {user.roles?.includes("franchise-admin") && (
        <div>
          Franchise Admin Dashboard: Oversee local franchises, analytics, and
          approvals.
        </div>
      )}

      {user.roles?.includes("sales-rep") && (
        <div>
          Sales Rep Dashboard: Track leads, conversions, and client
          interactions.
        </div>
      )}
    </div>
  );
}

export default DashboardHome;
