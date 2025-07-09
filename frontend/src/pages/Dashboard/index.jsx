import React from "react";
import AdminHome from "../../components/Dashboad/Admin/AdminHome";
import VendorHome from "../../components/Dashboad/Vendor/VendorHome";
import UserHome from "../../components/Dashboad/User/UserHome";
import FranchiseHome from "../../components/Dashboad/Franchise/FranchiseHome";
import SalesRepHome from "../../components/Dashboad/SalesRep/SalesRepHome";
import { useSession } from "../../context/SessionContext";
import AffiliateHome from "./Affiliate/AffiliateHome";

function DashboardHome() {
  const { user, loading } = useSession();

  if (loading) {
    return <div>Loading session...</div>;
  }

  if (!user) {
    return <div>Session expired or user not found.</div>;
  }

  return (
    <div>
      {/* Role-based dashboard views */}
      {user.roles?.includes("admin") && <AdminHome />}

      {user.roles?.includes("vendor") && <VendorHome />}

      {user.roles?.includes("user") && <UserHome />}

      {user.roles?.includes("franchise-admin") && <FranchiseHome />}

      {user.roles?.includes("sales-rep") && <SalesRepHome />}

      {/* {user.roles?.includes("affiliate") && <AffiliateHome />} */}
    </div>
  );
}

export default DashboardHome;
