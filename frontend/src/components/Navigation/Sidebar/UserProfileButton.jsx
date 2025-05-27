import SvgIcon from "@/app/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

export default async function UserProfileButton() {
  return (
    <div className="flex items-center space-x-2">
      <Avatar>
        <AvatarImage
          className="object-cover bg-transparent"
          src={"/userProfile.png"}
          alt={"session?.name"}
        />
        <AvatarFallback className="dark:text-white text-gray-900  dark:bg-gray-900 bg-gray-400">
          {"session?.name?.slice(0, 1)"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm text-gray-800 dark:text-gray-200">
          {"user?.fullName"}
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {"user?.primaryEmailAddress.emailAddress"}
        </span>
      </div>
    </div>
  );
}
