"use client";
import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import { Home } from "lucide-react"; // Import Home icon
import { Button } from "../ui/button"; // Import Button component
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components

import { useBreadcrumbTitle } from "./breadcrumb-provider";
import { SidebarTrigger } from "../ui/sidebar";
import { useSession } from "../../context/SessionContext";

function AppNavbar() {
  const breadcrumbTitle = useBreadcrumbTitle();
  const { user, loading } = useSession(); // Destructure loading from useSession

  return (
    // TooltipProvider should ideally wrap your entire application or at least the section
    // where tooltips are used for better performance. Placing it here for demonstration.
    <TooltipProvider>
      <nav className="border-2 border-purple-700 rounded-xl md:mx-10 mx-6 my-6">
        <div className="mx-auto px-6 py-1 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="md:hidden">
                <SidebarTrigger />
              </div>
              <div className="flex items-center">
                <h1 className="md:text-2xl font-bold text-purple-600">
                  {breadcrumbTitle}
                </h1>
              </div>
            </div>

            {!loading && (
              <div className="flex items-center space-x-4">
                {/* User Profile Info */}
                <div className="flex items-center justify-between mx-3">
                  <img
                    src="https://img.icons8.com/3d-fluency/94/guest-male--v2.png" // Consider using user.profileImage if available
                    alt="User Avatar"
                    className="md:h-10 h-6 rounded-full border border-white mr-2"
                  />
                  <p className="font-semibold text-sm">Hi, {user?.name}</p>
                </div>
                {/* Home Button with Tooltip */}
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Link to="/">
                      <Button
                        variant="ghost" // Use ghost variant for an icon button
                        size="icon" // Make it a square icon button
                        className="text-gray-700 hover:bg-purple-100 hover:text-purple-700"
                      >
                        <Home className="h-5 w-5" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Go to Home</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}

export default AppNavbar;
