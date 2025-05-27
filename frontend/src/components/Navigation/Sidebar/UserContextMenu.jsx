"use client";
import {
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { Key, LogOut, User } from "lucide-react";
import Link from "next/link";

export default function UserContextMenu() {
  return (
    <ContextMenuContent>
      <Link href="/dashboard/profile" className="cursor-pointer">
        <ContextMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </ContextMenuItem>
      </Link>
      <Link href="/dashboard/profile/manage-credentials">
        <ContextMenuItem>
          <Key className="mr-2 h-4 w-4" />
          Credentials
        </ContextMenuItem>
      </Link>
      <ContextMenuItem className="text-red-600 hover:bg-red-400 hover:text-red-800">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
