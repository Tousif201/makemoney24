"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
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
  Building,
  TrendingUp,
  DollarSign,
  Target,
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
import { Progress } from "@/components/ui/progress";

const franchiseMilestonesData = [
  {
    id: "FR001",
    milestone: "First Franchise Setup",
    reward: "$500",
    description: "Bonus for successfully setting up first franchise location",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 45,
    threshold: "1 franchise",
    category: "Setup",
  },
  {
    id: "FR002",
    milestone: "Revenue Milestone - Bronze",
    reward: "$1,000",
    description: "Achieve $50,000 in franchise revenue",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 78,
    threshold: "$50K revenue",
    category: "Revenue",
  },
  {
    id: "FR003",
    milestone: "Revenue Milestone - Silver",
    reward: "$2,500",
    description: "Achieve $100,000 in franchise revenue",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 34,
    threshold: "$100K revenue",
    category: "Revenue",
  },
  {
    id: "FR004",
    milestone: "Revenue Milestone - Gold",
    reward: "$5,000",
    description: "Achieve $250,000 in franchise revenue",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 12,
    threshold: "$250K revenue",
    category: "Revenue",
  },
  {
    id: "FR005",
    milestone: "Vendor Recruitment",
    reward: "$750",
    description: "Successfully recruit 10+ vendors to franchise",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 23,
    threshold: "10 vendors",
    category: "Growth",
  },
  {
    id: "FR006",
    milestone: "Multi-Location Bonus",
    reward: "$3,000",
    description: "Operate 3+ franchise locations successfully",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 8,
    threshold: "3 locations",
    category: "Expansion",
  },
  {
    id: "FR007",
    milestone: "Annual Excellence",
    reward: "$10,000",
    description: "Top performing franchise of the year",
    status: "Inactive",
    createdDate: "2023-12-01",
    totalClaimed: 3,
    threshold: "Annual top",
    category: "Excellence",
  },
];

export default function FranchiseMilestonesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [newMilestone, setNewMilestone] = useState({
    milestone: "",
    reward: "",
    threshold: "",
    category: "",
    description: "",
  });

  const filteredMilestones = franchiseMilestonesData.filter(
    (milestone) =>
      milestone.milestone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      milestone.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      milestone.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "Inactive":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryBadge = (category) => {
    const colors = {
      Setup: "bg-blue-100 text-blue-800",
      Revenue: "bg-green-100 text-green-800",
      Growth: "bg-purple-100 text-purple-800",
      Expansion: "bg-orange-100 text-orange-800",
      Excellence: "bg-yellow-100 text-yellow-800",
    };
    return <Badge className={colors[colors]}>{category}</Badge>;
  };

  const handleCreateMilestone = () => {
    console.log("Creating franchise milestone:", newMilestone);
    setIsCreateDialogOpen(false);
    setNewMilestone({
      milestone: "",
      reward: "",
      threshold: "",
      category: "",
      description: "",
    });
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
  };

  const handleUpdateMilestone = () => {
    console.log("Updating franchise milestone:", editingMilestone);
    setEditingMilestone(null);
  };

  const handleDeleteMilestone = (milestoneId) => {
    console.log("Deleting franchise milestone:", milestoneId);
  };

  const totalRewardsDistributed = filteredMilestones.reduce(
    (sum, milestone) => {
      const rewardAmount = Number.parseFloat(
        milestone.reward.replace("$", "").replace(",", "")
      );
      return sum + rewardAmount * milestone.totalClaimed;
    },
    0
  );

  const totalClaims = filteredMilestones.reduce(
    (sum, milestone) => sum + milestone.totalClaimed,
    0
  );

  return (
    <div>
      <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Franchise Milestones
            </h2>
            <p className="text-muted-foreground">
              Configure achievement rewards for franchise partners based on
              performance and growth
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800">
                <Plus className="mr-2 h-4 w-4" />
                Create Franchise Milestone
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Franchise Milestone</DialogTitle>
                <DialogDescription>
                  Set up a new achievement milestone for franchise partners with
                  specific targets and rewards.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="milestone" className="text-right">
                    Milestone Name
                  </Label>
                  <Input
                    id="milestone"
                    value={newMilestone.milestone}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        milestone: e.target.value,
                      }))
                    }
                    className="col-span-3"
                    placeholder="e.g., Platinum Revenue Achievement"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="threshold" className="text-right">
                    Achievement Target
                  </Label>
                  <Input
                    id="threshold"
                    value={newMilestone.threshold}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        threshold: e.target.value,
                      }))
                    }
                    className="col-span-3"
                    placeholder="e.g., $500K revenue"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reward" className="text-right">
                    Reward Amount
                  </Label>
                  <Input
                    id="reward"
                    value={newMilestone.reward}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        reward: e.target.value,
                      }))
                    }
                    className="col-span-3"
                    placeholder="e.g., $7,500"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Input
                    id="category"
                    value={newMilestone.category}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="col-span-3"
                    placeholder="e.g., Revenue, Growth, Expansion"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newMilestone.description}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="col-span-3"
                    placeholder="Detailed description of the achievement"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateMilestone}>
                  Create Milestone
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">
                Total Milestones
              </CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <Building className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                {filteredMilestones.length}
              </div>
              <p className="text-sm text-orange-700 mt-1">
                {filteredMilestones.filter((m) => m.status === "Active").length}{" "}
                active milestones
              </p>
              <Progress value={85} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                Achievements
              </CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {totalClaims}
              </div>
              <p className="text-sm text-green-700 mt-1">Milestones achieved</p>
              <Progress value={72} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                Rewards Paid
              </CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                ${totalRewardsDistributed.toLocaleString()}
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Total rewards distributed
              </p>
              <Progress value={78} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">
                Avg. Reward
              </CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                $
                {totalClaims > 0
                  ? (totalRewardsDistributed / totalClaims).toFixed(0)
                  : "0"}
              </div>
              <p className="text-sm text-purple-700 mt-1">Per achievement</p>
              <Progress value={65} className="mt-3 h-2" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">All Franchise Milestones</CardTitle>
            <CardDescription>
              Manage franchise achievement milestones and track performance
              rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search milestones..."
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
                    <TableHead>Milestone ID</TableHead>
                    <TableHead>Achievement</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Achieved</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMilestones.map((milestone) => (
                    <TableRow key={milestone.id}>
                      <TableCell className="font-medium">
                        {milestone.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {milestone.milestone}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {milestone.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700"
                        >
                          {milestone.threshold}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getCategoryBadge(milestone.category)}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {milestone.reward}
                      </TableCell>
                      <TableCell>{getStatusBadge(milestone.status)}</TableCell>
                      <TableCell className="font-medium">
                        {milestone.totalClaimed}
                      </TableCell>
                      <TableCell>{milestone.createdDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMilestone(milestone)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMilestone(milestone.id)}
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
          open={!!editingMilestone}
          onOpenChange={() => setEditingMilestone(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Franchise Milestone</DialogTitle>
              <DialogDescription>
                Update the milestone details and reward configuration.
              </DialogDescription>
            </DialogHeader>
            {editingMilestone && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-milestone" className="text-right">
                    Milestone Name
                  </Label>
                  <Input
                    id="edit-milestone"
                    value={editingMilestone.milestone}
                    onChange={(e) =>
                      setEditingMilestone((prev) => ({
                        ...prev,
                        milestone: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-threshold" className="text-right">
                    Target
                  </Label>
                  <Input
                    id="edit-threshold"
                    value={editingMilestone.threshold}
                    onChange={(e) =>
                      setEditingMilestone((prev) => ({
                        ...prev,
                        threshold: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-reward" className="text-right">
                    Reward
                  </Label>
                  <Input
                    id="edit-reward"
                    value={editingMilestone.reward}
                    onChange={(e) =>
                      setEditingMilestone((prev) => ({
                        ...prev,
                        reward: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Category
                  </Label>
                  <Input
                    id="edit-category"
                    value={editingMilestone.category}
                    onChange={(e) =>
                      setEditingMilestone((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleUpdateMilestone}>Update Milestone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
