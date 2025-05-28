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
import { Search, Plus, Edit, Trash2, Award } from "lucide-react";
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

const milestonesData = [
  {
    id: "M001",
    milestone: "First Purchase",
    reward: "$10",
    description: "Reward for making first purchase",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 1250,
  },
  {
    id: "M002",
    milestone: "Bronze Member",
    reward: "$25",
    description: "Achieve Bronze membership level",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 890,
  },
  {
    id: "M003",
    milestone: "Silver Member",
    reward: "$50",
    description: "Achieve Silver membership level",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 456,
  },
  {
    id: "M004",
    milestone: "Gold Member",
    reward: "$100",
    description: "Achieve Gold membership level",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 234,
  },
  {
    id: "M005",
    milestone: "Platinum Member",
    reward: "$250",
    description: "Achieve Platinum membership level",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 67,
  },
  {
    id: "M006",
    milestone: "Referral Bonus",
    reward: "$15",
    description: "Reward for successful referral",
    status: "Inactive",
    createdDate: "2023-12-10",
    totalClaimed: 345,
  },
];

export default function MembershipMilestonesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [newMilestone, setNewMilestone] = useState({
    milestone: "",
    reward: "",
  });

  const filteredMilestones = milestonesData.filter(
    (milestone) =>
      milestone.milestone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      milestone.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleCreateMilestone = () => {
    // Handle milestone creation logic here
    console.log("Creating milestone:", newMilestone);
    setIsCreateDialogOpen(false);
    setNewMilestone({ milestone: "", reward: "" });
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
  };

  const handleUpdateMilestone = () => {
    // Handle milestone update logic here
    console.log("Updating milestone:", editingMilestone);
    setEditingMilestone(null);
  };

  const handleDeleteMilestone = (milestoneId) => {
    // Handle milestone deletion logic here
    console.log("Deleting milestone:", milestoneId);
  };

  const totalRewardsDistributed = filteredMilestones.reduce(
    (sum, milestone) => {
      const rewardAmount = Number.parseFloat(milestone.reward.replace("$", ""));
      return sum + rewardAmount * milestone.totalClaimed;
    },
    0
  );

  return (
    <div>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
      Membership Milestones
    </h2>
    <p className="text-muted-foreground text-sm sm:text-base">
      Manage membership milestone rewards and thresholds
    </p>
  </div>

  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
    <DialogTrigger asChild>
      <Button className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Create Milestone
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-md w-full">
      <DialogHeader>
        <DialogTitle>Create New Milestone</DialogTitle>
        <DialogDescription>
          Add a new membership milestone with its reward amount.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="milestone" className="sm:text-right">
            Milestone
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
            className="sm:col-span-3"
            placeholder="e.g., Diamond Member"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="reward" className="sm:text-right">
            Reward
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
            className="sm:col-span-3"
            placeholder="e.g., $500"
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleCreateMilestone} className="w-full sm:w-auto">
          Create Milestone
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>


        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Milestones
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredMilestones.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredMilestones.filter((m) => m.status === "Active").length}{" "}
                active milestones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Claims
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredMilestones
                  .reduce((sum, m) => sum + m.totalClaimed, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Milestone rewards claimed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rewards Distributed
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalRewardsDistributed.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total value distributed
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Milestones</CardTitle>
            <CardDescription>
              Manage membership milestone rewards and track their performance
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
                    <TableHead>Milestone</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Claimed</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMilestones.map((milestone) => (
                    <TableRow key={milestone.id}>
                      <TableCell className="font-medium">
                        {milestone.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {milestone.milestone}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {milestone.reward}
                      </TableCell>
                      <TableCell>{milestone.description}</TableCell>
                      <TableCell>{getStatusBadge(milestone.status)}</TableCell>
                      <TableCell>
                        {milestone.totalClaimed.toLocaleString()}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Milestone</DialogTitle>
              <DialogDescription>
                Update the milestone details and reward amount.
              </DialogDescription>
            </DialogHeader>
            {editingMilestone && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-milestone" className="text-right">
                    Milestone
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
