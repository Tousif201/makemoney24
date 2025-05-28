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
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "../../../context/SessionContext";

export default function SidebarMenuContent() {
  const { session, loading } = useSession();
  const { toggleSidebar } = useSidebar();
  const { pathname } = useLocation();
  const [openCollapsibleIndex, setOpenCollapsibleIndex] = useState(null);

  const handleMenuClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) toggleSidebar();
  };

  const isActive = (href) => pathname === href;

  /* ---------------- Skeleton while loading ---------------- */
  if (loading) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu className="space-y-2 px-4 py-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full rounded-md bg-gray-200" />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  /* ---------------- Menu after load ---------------- */
  const role = session?.role;
  const roleConfig = [...sidebarConfig.shared, ...(sidebarConfig[role] || [])];

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1 px-3 py-4">
          {roleConfig.map((item, idx) =>
            item.items ? (
              /* -------- Collapsible parent item -------- */
              <Collapsible
                key={idx}
                open={
                  openCollapsibleIndex === idx ||
                  item.items.some((sub) => isActive(sub.href))
                }
                onOpenChange={(isOpen) => setOpenCollapsibleIndex(isOpen ? idx : null)}
              >
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 transition
                      ${openCollapsibleIndex === idx ||
                        item.items.some((sub) => isActive(sub.href))
                        ? "bg-purple-100 text-purple-700"
                        : "hover:bg-gray-100 text-gray-600"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="text-lg" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>

                <CollapsibleContent className="space-y-1 pl-8 pr-3 py-1">
                  {item.items.map((sub, subIdx) => (
                    <SidebarMenuItem key={subIdx}>
                      <SidebarMenuButton
                        asChild
                        className={`w-full rounded px-2 py-1.5 text-sm transition
                          ${isActive(sub.href)
                            ? "bg-purple-200 text-gray-800 font-semibold"
                            : "hover:bg-gray-50 text-gray-600"
                          }`}
                      >
                        <Link to={sub.href} onClick={handleMenuClick} className="flex items-center space-x-2">
                          <sub.icon className="text-base" />
                          <span>{sub.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              /* -------- Single-level item -------- */
              <SidebarMenuItem key={idx}>
                <SidebarMenuButton
                  asChild
                  className={`w-full rounded-md px-3 py-2 text-base font-medium transition
                    ${isActive(item.href)
                      ? "bg-purple-300 text-purple-800 shadow-sm"
                      : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  <Link to={item.href} onClick={handleMenuClick} className="flex items-center space-x-3">
                    <item.icon className="text-lg" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}

          {/* -------- Logout button -------- */}

          <SidebarMenuItem>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
