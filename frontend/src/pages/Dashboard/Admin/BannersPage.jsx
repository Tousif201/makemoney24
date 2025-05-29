"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { ImageIcon, Edit, Trash2, Loader2 } from "lucide-react"; // Added Loader2 for loading state
import CreateBannerDialog from "../../../components/Dialogs/CreateBannerDialog";
import {
  deleteBanner,
  getAllBanners,
  updateBanner,
} from "../../../../api/banner";
import { deleteFiles, uploadFiles } from "../../../../api/upload";
import { toast } from "sonner"; // Assuming sonner for toasts

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editingFile, setEditingFile] = useState(null); // State for new file during edit
  const [deletingBannerId, setDeletingBannerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // New state for update button loading

  // --- Fetch Banners on Load ---
  useEffect(() => {
    const fetchBanners = async () => {
      setIsLoading(true);
      try {
        const data = await getAllBanners();
        setBanners(data);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
        toast.error("Failed to load banners. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // --- Handlers ---
  const handleEditBanner = (banner) => {
    setEditingBanner({ ...banner }); // Create a copy to avoid direct state mutation
    setEditingFile(null); // Reset file selection on opening edit dialog
  };

  const handleEditingFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditingFile(file);
    }
  };

  const handleUpdateBanner = async () => {
    if (!editingBanner || !editingBanner.redirectTo) {
      toast.error("Redirect URL cannot be empty.");
      return;
    }

    setIsUpdating(true);
    try {
      let imageUrl = editingBanner.image?.url;
      let imageKey = editingBanner.image?.key;

      // If a new file is selected, upload it
      if (editingFile) {
        const uploaded = await uploadFiles([editingFile]);
        if (!uploaded || uploaded.length === 0) {
          throw new Error("New image upload failed");
        }
        imageUrl = uploaded[0].url;
        imageKey = uploaded[0].key;

        // If there was an old image, delete it from storage
        if (editingBanner.image?.key) {
          console.log([editingBanner.image.key]);
          await deleteFiles([editingBanner.image.key]);
        }
      }

      const updatedPayload = {
        image: imageUrl ? { url: imageUrl, key: imageKey } : null,
        redirectTo: editingBanner.redirectTo,
      };

      const res = await updateBanner(editingBanner._id, updatedPayload);
      console.log("Banner updated:", res);

      toast.success("Banner updated successfully!");

      // Refresh banners list and close dialog
      const data = await getAllBanners();
      setBanners(data);
      setEditingBanner(null);
      setEditingFile(null); // Clear editing file after successful update
    } catch (error) {
      console.error("Failed to update banner:", error);
      toast.error("Failed to update banner. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!deletingBannerId) return;

    try {
      // Find the banner to get its image key for deletion from storage
      const bannerToDelete = banners.find((b) => b._id === deletingBannerId);

      await deleteBanner(deletingBannerId);

      // If the banner had an image, delete it from storage
      if (bannerToDelete && bannerToDelete.image?.key) {
        await deleteFiles([bannerToDelete.image.key]);
      }

      toast.success("Banner deleted successfully!");
      // Refresh banners list
      setBanners(banners.filter((b) => b._id !== deletingBannerId));
    } catch (error) {
      console.error("Failed to delete banner:", error);
      toast.error("Failed to delete banner. Please try again.");
    } finally {
      setDeletingBannerId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {" "}
      {/* Added space-y for consistent spacing */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Banners</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage promotional banners for your storefront.
          </p>
        </div>
        <CreateBannerDialog />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banners.length}</div>
          </CardContent>
        </Card>
        {/* You can add more Stat Cards here if needed, e.g., for clicks, impressions etc. */}
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Banners</CardTitle>
          <CardDescription>
            View and manage all your existing banners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>{" "}
                  {/* Added width for image column */}
                  <TableHead>Redirect URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Loading banners...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : banners.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No banners found. Create one to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  banners.map((banner) => (
                    <TableRow key={banner._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={banner.image?.url || "/placeholder-image.png"} // Fallback image
                            alt={banner.redirectTo || "Banner image"}
                            width={80} // Increased size for better preview
                            height={50}
                            className="rounded object-cover border"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-blue-600 hover:underline">
                          <a
                            href={banner.redirectTo}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {banner.redirectTo}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline" // Changed to outline for better visual cue
                            size="sm"
                            onClick={() => handleEditBanner(banner)}
                            className="text-gray-600 hover:bg-gray-100"
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive" // Changed to destructive variant
                                size="sm"
                                onClick={() => setDeletingBannerId(banner._id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <div>
                                  This action cannot be undone. This will
                                  permanently delete the banner and remove its
                                  data from our servers.
                                </div>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => setDeletingBannerId(null)}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={handleDeleteBanner}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Edit Banner Dialog */}
      <Dialog
        open={!!editingBanner}
        onOpenChange={() => {
          setEditingBanner(null);
          setEditingFile(null); // Clear file state when closing dialog
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Edit Banner
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update the banner's redirect URL or change its image.
            </DialogDescription>
          </DialogHeader>
          {editingBanner && (
            <div className="grid gap-3 sm:gap-4 py-4">
              {/* Redirect URL Input */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
                <Label
                  htmlFor="editRedirectUrl"
                  className="text-right sm:mb-0 mb-1"
                >
                  Redirect URL
                </Label>
                <Input
                  id="editRedirectUrl"
                  value={editingBanner.redirectTo}
                  onChange={(e) =>
                    setEditingBanner((prev) => ({
                      ...prev,
                      redirectTo: e.target.value,
                    }))
                  }
                  className="col-span-3 sm:col-span-3 h-9 sm:h-10 text-xs sm:text-sm"
                  placeholder="/products/category"
                />
              </div>

              {/* Image Input */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
                <Label
                  htmlFor="editBannerImage"
                  className="text-right sm:mb-0 mb-1"
                >
                  New Image
                </Label>
                <Input
                  id="editBannerImage"
                  type="file"
                  accept="image/*"
                  onChange={handleEditingFileChange}
                  className="col-span-3 sm:col-span-3 text-xs sm:text-sm"
                />
              </div>

              {/* Image Preview */}
              {(editingFile || editingBanner.image?.url) && (
                <div className="col-span-full flex justify-center mt-2">
                  <img
                    src={
                      editingFile
                        ? URL.createObjectURL(editingFile)
                        : editingBanner.image?.url || "/placeholder-image.png"
                    }
                    alt="Banner Preview"
                    className="max-h-40 rounded shadow border"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex justify-end gap-2 sm:gap-3">
            <Button
              onClick={handleUpdateBanner}
              disabled={isUpdating}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
