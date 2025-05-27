import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import SidebarMenuContent from "./SidebarMenuContent";

// Sidebar Header Component
function SidebarHeaderContent() {
  return (
    <SidebarHeader>
      <SidebarMenuButton
        className="h-auto flex justify-center items-center"
        asChild
      >
        <a href="#">
          <img
            src="/logo.png"
            className="h-16 w-16 text-gray-900 dark:text-purple rounded-2xl"
          />{" "}
          <div className="flex flex-col">
            <span className=" text-gray-800 dark:text-gray-200 text-xl font-semibold uppercase">
              Zentor
            </span>
          </div>
        </a>
      </SidebarMenuButton>
    </SidebarHeader>
  );
}

// Main AppSidebar Component
export function AppSidebar() {
  const role = "user";

  return (
    <Sidebar variant="floating" className={"bg-[#1C1F30] "} collapsible="icon">
      <SidebarHeaderContent />
      <SidebarContent className={""}>
        <SidebarMenuContent role={role} />
      </SidebarContent>
      {/* <SidebarFooterContent /> */}
    </Sidebar>
  );
}
