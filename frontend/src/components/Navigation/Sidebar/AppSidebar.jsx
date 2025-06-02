import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import SidebarMenuContent from "./SidebarMenuContent";
import logo from "../../../assets/makemoney.png";
import { logoutUser } from "../../../../api/auth";
import { useEffect } from "react";
import { useSession } from "../../../context/SessionContext";

// Sidebar Header Component
function SidebarHeaderContent() {
  return (
    <SidebarHeader>
      <SidebarMenuButton
        className="h-auto flex justify-center items-center"
        asChild
      >
        <Link to="#">
          <img
            src={logo}
            className="h-20 w-20 text-gray-900 dark:text-purple rounded-2xl"
          />
        </Link>
      </SidebarMenuButton>
    </SidebarHeader>
  );
}

// Main AppSidebar Component
export function AppSidebar() {
  const role = "user";
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // await logoutUser(); // API call to logout
      localStorage.clear(); // Clear token or user data
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <Sidebar variant="floating" className="" collapsible="icon">
      <SidebarHeaderContent />
      <SidebarContent>
        <SidebarMenuContent role={role} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          asChild
          className="w-full rounded-md px-2 py-2 flex justify-center items-center text-xl font-bold text-white bg-red-600 hover:bg-red-500 transition cursor-pointer"
        >
          <button onClick={handleLogout} className="w-full mb-10 ">
            Logout
          </button>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
