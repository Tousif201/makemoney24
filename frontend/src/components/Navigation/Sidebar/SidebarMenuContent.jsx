import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { sidebarConfig } from "./sidebarConfig";
import { useLocation, Link } from "react-router-dom";

export default function SidebarMenuContent({ role }) {
  const roleConfig = [...sidebarConfig.shared, ...(sidebarConfig[role] || [])];
  const { toggleSidebar } = useSidebar();
  const { pathname } = useLocation(); // Replaces usePathname from Next.js

  const [openCollapsibleIndex, setOpenCollapsibleIndex] = useState(null);

  const handleMenuClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const isActive = (href) => {
    return pathname === href;
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1 px-2 py-3">
          {roleConfig.map((item, idx) =>
            item.items ? (
              <Collapsible
                key={idx}
                open={openCollapsibleIndex === idx}
                onOpenChange={(isOpen) => setOpenCollapsibleIndex(isOpen ? idx : null)}
                className="group/collapsible transition-all duration-300"
              >
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-md transition
                      ${
                        openCollapsibleIndex === idx || item.items.some((subItem) => isActive(subItem.href))
                          ? "bg-green-700/30 text-green-300"
                          : "hover:bg-muted/10 text-gray-300"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="text-lg" />
                      <p className="text-base font-medium">{item.label}</p>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>

                <CollapsibleContent
                  className="pl-7 pr-3 py-1 space-y-1
                             overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
                >
                  {item.items.map((subItem, subIdx) => (
                    <SidebarMenuItem key={subIdx}>
                      <SidebarMenuButton
                        asChild
                        className={`w-full text-sm rounded px-2 py-1.5 transition
                          ${
                            isActive(subItem.href)
                              ? "bg-green-600 text-white font-semibold shadow-sm"
                              : "hover:bg-muted/5 text-gray-400"
                          }`}
                      >
                        <Link
                          to={subItem.href}
                          onClick={handleMenuClick}
                          className="flex items-center space-x-2"
                        >
                          <subItem.icon className="text-base" />
                          <span>{subItem.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={idx}>
                <SidebarMenuButton
                  asChild
                  className={`w-full text-lg font-medium px-3 py-2 rounded-md transition
                    ${
                      isActive(item.href)
                        ? "bg-green-600 text-white shadow-sm"
                        : "hover:bg-muted/10 text-gray-300"
                    }`}
                >
                  <Link
                    to={item.href}
                    onClick={handleMenuClick}
                    className="flex items-center space-x-3"
                  >
                    <item.icon className="text-lg" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="w-full px-3 py-2 text-base font-medium hover:bg-muted/10 rounded-md transition"
            >
              <div onClick={handleMenuClick}>
                {/* <LogoutButton /> */}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
