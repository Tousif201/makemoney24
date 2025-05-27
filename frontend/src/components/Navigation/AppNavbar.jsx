"use client";
import React from "react";
import { useBreadcrumbTitle } from "./breadcrumb-provider";
import { SidebarTrigger } from "../ui/sidebar";
import { useSession } from "../../hooks/useSession";

function AppNavbar() {
  const breadcrumbTitle = useBreadcrumbTitle();
  const { user, loading } = useSession();
  return (
    <nav className="border border-green-800 rounded-xl md:mx-10 mx-6 my-6 ">
      <div className="mx-auto px-6 py-1 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex items-center">
              <h1 className=" md:text-2xl font-semibold text-green-600">
                {breadcrumbTitle}
              </h1>
            </div>
          </div>

          {!loading && (
            <div className="flex items-center space-x-4 ">
              <div className="flex items-center justify-between mx-3">
                <img
                  src="https://img.icons8.com/3d-fluency/94/guest-male--v2.png"
                  alt=""
                  className=" md:h-10 h-6  rounded-full border border-white mr-2"
                />
                <p className="font-semibold text-sm">Hi, {user?.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AppNavbar;
