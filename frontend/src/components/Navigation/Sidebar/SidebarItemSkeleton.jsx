import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function SidebarItemSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-8 w-8 rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  );
}

export default SidebarItemSkeleton;
