import React from "react";
import AdminHome from "../../components/Dashboad/Admin/AdminHome";
import VendorHome from "../../components/Dashboad/Vendor/VendorHome";
import UserHome from "../../components/Dashboad/User/UserHome";
import FranchiseHome from "../../components/Dashboad/Franchise/FranchiseHome";
import SalesRepHome from "../../components/Dashboad/SalesRep/SalesRepHome";
import AffiliateHome from "./Affiliate/AffiliateHome";
import { useSession } from "../../context/SessionContext";

function DashboardHome() {
  const { user, loading, session } = useSession();

  if (loading) {
    return <div>Loading session...</div>;
  }

  if (!user) {
    return <div>Session expired or user not found.</div>;
  }

  return (
    <div>
      {/* Role-based dashboard views */}
      {session.role === "admin" && <AdminHome />}
      {session.role === "vendor" && <VendorHome />}
      {session.role === "user" && <UserHome />}
      {session.role === "franchise-admin" && <FranchiseHome />}
      {session.role === "sales-rep" && <SalesRepHome />}
      {session.role === "affiliate" && <AffiliateHome />}
    </div>
  );
}

export default DashboardHome;
