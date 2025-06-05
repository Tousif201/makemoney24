import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createBanner } from "../../../api/banner";
import { uploadFiles } from "../../../api/upload";
import { toast } from "sonner";

function CreateBannerDialog() {
  const [newBanner, setNewBanner] = useState({
    redirectUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCreateBanner = async () => {
    if (!selectedFile || !newBanner.redirectUrl) {
      toast.error("Missing fields", {
        description: "Please select an image and enter a redirect URL.",
      });
      return;
    }

    setIsCreating(true);
    try {
      const uploaded = await uploadFiles([selectedFile]);
      if (!uploaded || uploaded.length === 0) {
        throw new Error("Image upload failed");
      }

      const { url, key } = uploaded[0];

      const bannerPayload = {
        image: { url, key },
        redirectTo: newBanner.redirectUrl,
      };

      const res = await createBanner(bannerPayload);
      console.log("Banner created:", res);

      toast.success("Banner created", {
        description: "Your banner has been successfully created.",
      });

      setNewBanner({ redirectUrl: "" });
      setSelectedFile(null);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create banner:", error);
      toast.error("Banner creation failed", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 sm:h-10 text-xs sm:text-sm">
          <Plus className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
          Create Banner
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Create New Banner
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Design a new promotional banner for your store with custom redirect
            URL.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:gap-4 py-4">
          {/* Redirect URL Input */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
            <Label htmlFor="redirectUrl" className="text-right sm:mb-0 mb-1">
              Redirect URL
            </Label>
            <Input
              id="redirectUrl"
              value={newBanner.redirectUrl}
              onChange={(e) =>
                setNewBanner((prev) => ({
                  ...prev,
                  redirectUrl: e.target.value,
                }))
              }
              className="col-span-3 sm:col-span-3 h-9 sm:h-10 text-xs sm:text-sm"
              placeholder="/products/category"
            />
          </div>

          {/* Image Input */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
            <Label htmlFor="bannerImage" className="text-right sm:mb-0 mb-1">
              Banner Image
            </Label>
            <Input
              id="bannerImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="col-span-3 sm:col-span-3 text-xs sm:text-sm"
            />
            {/* Message for recommended image size */}
            <p className="col-span-full text-sm text-gray-500 mt-1 sm:ml-[calc(25%+1rem)]">
              Recommended: <span className="font-bold">1920 x 800</span> pixels
              for best display.
            </p>
          </div>

          {/* Image Preview */}
          {selectedFile && (
            <div className="col-span-full flex justify-center mt-2">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="max-h-40 rounded shadow"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2 sm:gap-3">
          <Button
            onClick={handleCreateBanner}
            disabled={isCreating}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          >
            {isCreating ? "Creating..." : "Create Banner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateBannerDialog;
