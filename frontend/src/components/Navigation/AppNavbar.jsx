"use client";

import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Camera, Home } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useBreadcrumbTitle } from "./breadcrumb-provider";
import { SidebarTrigger } from "../ui/sidebar";
import { useSession } from "../../context/SessionContext";
import { uploadFiles } from "../../../api/upload";
import { uploadProfileImage } from "../../../api/user";
import { toast } from "sonner";

function AppNavbar() {
  const breadcrumbTitle = useBreadcrumbTitle();
  const { user, loading } = useSession();
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("No file selected.");
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first.");
      return;
    }
    try {
      const uploaded = await uploadFiles([selectedFile]);
      if (!uploaded || uploaded.length === 0) {
        toast.error("Image upload failed.");
        return;
      }

      const { url, key } = uploaded[0];
      const profileImagePayload = {
        profileImage: { url, key },
        userId: user._id,
      };

      const res = await uploadProfileImage(profileImagePayload);
      if (res?.success) {
        toast.success("Profile photo uploaded successfully!");
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Something went wrong. Try again later.");
    }
  };

  return (
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
                <div className="flex items-center justify-between mx-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative cursor-pointer">
                        <img
                          src={
                            preview ||
                            user.profileImage ||
                            "https://img.icons8.com/3d-fluency/94/guest-male--v2.png"
                          }
                          alt="User Avatar"
                          className="md:h-15 h-12 w-12 md:w-15 rounded-full border border-white object-cover"
                        />
                        <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-black/60 shadow-md hover:bg-gray-100">
                          <Camera className="h-2 w-2 text-gray-600 cursor-pointer" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Profile Photo</DialogTitle>
                      </DialogHeader>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                      {preview && (
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-24 h-24 rounded-full object-cover mx-auto my-4"
                        />
                      )}
                      <DialogFooter className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = null;
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="button"
                          onClick={handleSubmit} >
                          Upload
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <p className="font-semibold text-sm ml-3">Hi,{user?.name}</p>
                </div>

                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Link to="/">
                      <Button
                        variant="ghost"
                        size="icon"
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
