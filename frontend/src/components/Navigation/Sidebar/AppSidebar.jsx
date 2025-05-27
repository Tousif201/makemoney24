import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import SidebarMenuContent from "./SidebarMenuContent";
import logo from "../../../assets/makemoney.png"
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
          />{" "}
          <div className="flex flex-col">
            {/* <span className=" text-gray-800 dark:text-gray-200 text-xl font-semibold uppercase">
            
            </span> */}
          </div>
        </Link>
      </SidebarMenuButton>
    </SidebarHeader>
  );
}

// Main AppSidebar Component
export function AppSidebar() {
  const role = "user";

  return (
    <Sidebar variant="floating" className={" "} collapsible="icon">
      <SidebarHeaderContent />
      <SidebarContent className={""}>
        <SidebarMenuContent role={role} />
      </SidebarContent>
      {/* <SidebarFooterContent /> */}
    </Sidebar>
  );
}
