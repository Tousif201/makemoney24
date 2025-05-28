import React from "react";
import { AppSidebar } from "../components/Navigation/Sidebar/AppSidebar";
import AppNavbar from "../components/Navigation/AppNavbar";
import { SidebarProvider } from "../components/ui/sidebar";
import { useSession } from "../context/SessionContext";

const DashboardLayout = ({ children }) => {
  const { session, loading } = useSession();

  // Redirect if not authenticated and loading is done
  if (!session && loading === false) {
    console.log(session, loading);
    window.location.href = "/login";
    return null; // Prevent rendering
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <main className="w-full min-h-screen backdrop-blur-md bg-white/10 ">
        <AppNavbar />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default DashboardLayout;
