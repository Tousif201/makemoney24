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
import { logoutUser } from "../../../../api/auth"; // Assuming this is your API call
import { useEffect } from "react";
import { useSession } from "../../../context/SessionContext";
import { toast } from "sonner"; // Import toast from sonner

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
            alt="Logo" // Added alt text for accessibility
          />
        </Link>
      </SidebarMenuButton>
    </SidebarHeader>
  );
}

// Main AppSidebar Component
export function AppSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.clear();

      toast.success("Logged out successfully!"); // Sonner toast for success
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again."); // Sonner toast for error
    }
  };

  return (
    <Sidebar variant="floating" className="" collapsible="icon">
      <SidebarHeaderContent />
      <SidebarContent>
        <SidebarMenuContent />
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
