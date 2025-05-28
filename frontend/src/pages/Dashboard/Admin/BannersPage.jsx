"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ImageIcon,
  ExternalLink,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const bannersData = [
  {
    id: "B001",
    title: "Summer Sale 2024",
    description: "Get up to 50% off on all summer collection items",
    imageUrl: "/placeholder.svg?height=200&width=400",
    redirectUrl: "/products/summer-sale",
    position: "Hero",
    status: "Active",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    clicks: 1250,
    impressions: 15600,
    ctr: "8.01%",
  },
  {
    id: "B002",
    title: "New Arrivals",
    description: "Check out our latest product arrivals",
    imageUrl: "/placeholder.svg?height=200&width=400",
    redirectUrl: "/products/new-arrivals",
    position: "Sidebar",
    status: "Active",
    startDate: "2024-03-01",
    endDate: "2024-12-31",
    clicks: 890,
    impressions: 12400,
    ctr: "7.18%",
  },
  {
    id: "B003",
    title: "Membership Benefits",
    description: "Join our membership program for exclusive benefits",
    imageUrl: "/placeholder.svg?height=200&width=400",
    redirectUrl: "/membership",
    position: "Footer",
    status: "Inactive",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    clicks: 456,
    impressions: 8900,
    ctr: "5.12%",
  },
  {
    id: "B004",
    title: "Franchise Opportunities",
    description: "Start your own franchise with us",
    imageUrl: "/placeholder.svg?height=200&width=400",
    redirectUrl: "/franchise",
    position: "Header",
    status: "Active",
    startDate: "2024-02-15",
    endDate: "2024-12-31",
    clicks: 234,
    impressions: 5600,
    ctr: "4.18%",
  },
];

export default function BannersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({
    title: "",
    description: "",
    redirectUrl: "",
    position: "",
    startDate: "",
    endDate: "",
  });

  const filteredBanners = bannersData.filter(
    (banner) =>
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "Inactive":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      case "Scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPositionBadge = (position) => {
    const colors = {
      Hero: "bg-purple-100 text-purple-800",
      Header: "bg-blue-100 text-blue-800",
      Sidebar: "bg-orange-100 text-orange-800",
      Footer: "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[position]}>{position}</Badge>;
  };

  const handleCreateBanner = () => {
    console.log("Creating banner:", newBanner);
    setIsCreateDialogOpen(false);
    setNewBanner({
      title: "",
      description: "",
      redirectUrl: "",
      position: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
  };

  const handleUpdateBanner = () => {
    console.log("Updating banner:", editingBanner);
    setEditingBanner(null);
  };

  const handleDeleteBanner = (bannerId) => {
    console.log("Deleting banner:", bannerId);
  };

  const toggleBannerStatus = (bannerId) => {
    console.log("Toggling banner status:", bannerId);
  };

  const totalClicks = filteredBanners.reduce(
    (sum, banner) => sum + banner.clicks,
    0
  );
  const totalImpressions = filteredBanners.reduce(
    (sum, banner) => sum + banner.impressions,
    0
  );
  const averageCTR =
    totalImpressions > 0
      ? ((totalClicks / totalImpressions) * 100).toFixed(2)
      : "0.00";

  return (
    <div>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Banners
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Create and manage promotional banners for your ecommerce store
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
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
                  Design a new promotional banner for your store with custom redirect URL.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
                  <Label htmlFor="title" className="text-right sm:mb-0 mb-1">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={newBanner.title}
                    onChange={(e) =>
                      setNewBanner((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="col-span-3 sm:col-span-3 h-9 sm:h-10 text-xs sm:text-sm"
                    placeholder="Banner title"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
                  <Label htmlFor="description" className="text-right sm:mb-0 mb-1">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newBanner.description}
                    onChange={(e) =>
                      setNewBanner((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="col-span-3 sm:col-span-3 h-20 sm:h-24 text-xs sm:text-sm"
                    placeholder="Banner description"
                  />
                </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
                  <Label htmlFor="position" className="text-right sm:mb-0 mb-1">
                    Position
                  </Label>
                  <Select
                    value={newBanner.position}
                    onValueChange={(value) =>
                      setNewBanner((prev) => ({ ...prev, position: value }))
                    }
                  >
                    <SelectTrigger className="col-span-3 sm:col-span-3 h-9 sm:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hero">Hero</SelectItem>
                      <SelectItem value="Header">Header</SelectItem>
                      <SelectItem value="Sidebar">Sidebar</SelectItem>
                      <SelectItem value="Footer">Footer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
                  <Label htmlFor="startDate" className="text-right sm:mb-0 mb-1">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newBanner.startDate}
                    onChange={(e) =>
                      setNewBanner((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="col-span-3 sm:col-span-3 h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
                  <Label htmlFor="endDate" className="text-right sm:mb-0 mb-1">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newBanner.endDate}
                    onChange={(e) =>
                      setNewBanner((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="col-span-3 sm:col-span-3 h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>
              <DialogFooter className="flex justify-end gap-2 sm:gap-3">
                <Button onClick={handleCreateBanner} className="h-9 sm:h-10 text-xs sm:text-sm">
                  Create Banner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Banners
              </CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredBanners.length}</div>
              <p className="text-xs text-muted-foreground">
                {filteredBanners.filter((b) => b.status === "Active").length}{" "}
                active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clicks
              </CardTitle>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalClicks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Banner clicks this period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalImpressions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total banner views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageCTR}%</div>
              <p className="text-xs text-muted-foreground">
                Click-through rate
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Banners</CardTitle>
            <CardDescription>
              Manage your promotional banners, track performance, and update
              content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search banners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Banner</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBanners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={banner.imageUrl || "/placeholder.svg"}
                            alt={banner.title}
                            width={60}
                            height={40}
                            className="rounded object-cover"
                          />
                          <div>
                            <div className="font-medium">{banner.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {banner.description}
                            </div>
                            <div className="text-xs text-blue-600">
                              {banner.redirectUrl}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getPositionBadge(banner.position)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(banner.status)}
                          <Switch
                            checked={banner.status === "Active"}
                            onCheckedChange={() =>
                              toggleBannerStatus(banner.id)
                            }
                            size="sm"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{banner.startDate}</div>
                          <div className="text-sm text-muted-foreground">
                            to {banner.endDate}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">
                            {banner.clicks.toLocaleString()} clicks
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {banner.impressions.toLocaleString()} views
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{banner.ctr}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditBanner(banner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog
          open={!!editingBanner}
          onOpenChange={() => setEditingBanner(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Banner</DialogTitle>
              <DialogDescription>
                Update banner details and settings.
              </DialogDescription>
            </DialogHeader>
            {editingBanner && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="edit-title"
                    value={editingBanner.title}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={editingBanner.description}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-redirectUrl" className="text-right">
                    Redirect URL
                  </Label>
                  <Input
                    id="edit-redirectUrl"
                    value={editingBanner.redirectUrl}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({
                        ...prev,
                        redirectUrl: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleUpdateBanner}>Update Banner</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
