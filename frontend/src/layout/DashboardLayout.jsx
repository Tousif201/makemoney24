import React from "react";
import { AppSidebar } from "../components/Navigation/Sidebar/AppSidebar";
import AppNavbar from "../components/Navigation/AppNavbar";
import { SidebarProvider } from "../components/ui/sidebar";

const DashboardLayout = ({ children }) => (
  <SidebarProvider defaultOpen={true}>
    <div className="fixed top-0 left-0 w-full h-full bg-slate-950 z-[-1]" />

    <AppSidebar />
    <main className="w-full min-h-screen backdrop-blur-md bg-white/10 text-white">
      <AppNavbar />
      {children}
    </main>
  </SidebarProvider>
);

export default DashboardLayout;
