"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Search, Plus, Edit, Trash2, Award, Loader2 } from "lucide-react";
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
import { toast } from "sonner"; // Assuming you have shadcn/ui toast or similar for notifications

import { MembershipMilestoneService } from "../../../../api/membershipmilestone"; // Adjust path as necessary

export default function MembershipMilestonesPage() {
  const [milestones, setMilestones] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [newMilestone, setNewMilestone] = useState({
    name: "",
    rewardAmount: "",
    description: "", // Added description as per backend controller
    status: "active", // Default status
    milestone: 0, // Assuming milestone is a number
    timeLimitDays: 0, // Assuming timeLimitDays is a number
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMilestones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await MembershipMilestoneService.getAllMilestones();
      setMilestones(response.data);
    } catch (err) {
      console.error("Failed to fetch milestones:", err);
      setError("Failed to load milestones.");
      toast.error("Failed to load milestones.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await MembershipMilestoneService.getMilestoneStats();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      // Optionally set an error for stats if needed, but often okay to just not display them
    }
  }, []);

  useEffect(() => {
    fetchMilestones();
    fetchStats();
  }, [fetchMilestones, fetchStats]);

  const filteredMilestones = milestones.filter(
    (milestone) =>
      milestone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      milestone.description?.toLowerCase().includes(searchTerm.toLowerCase()) // Ensure description exists
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleCreateMilestone = async () => {
    setIsSubmitting(true);
    try {
      await MembershipMilestoneService.createMilestone(newMilestone);
      toast.success("Milestone created successfully!");
      setIsCreateDialogOpen(false);
      setNewMilestone({
        name: "",
        rewardAmount: "",
        description: "",
        status: "active",
        milestone: 0,
        timeLimitDays: 0,
      });
      fetchMilestones(); // Refresh list
      fetchStats(); // Refresh stats
    } catch (err) {
      console.error("Error creating milestone:", err);
      toast.error(
        err.message || "Failed to create milestone. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone({
      ...milestone,
      rewardAmount: milestone.rewardAmount.toString(), // Ensure it's a string for input value
      milestone: milestone.milestone.toString(), // Ensure it's a string for input value
      timeLimitDays: milestone.timeLimitDays?.toString() || "0", // Ensure it's a string
    });
  };

  const handleUpdateMilestone = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: editingMilestone.name,
        rewardAmount: parseFloat(editingMilestone.rewardAmount), // Convert back to number
        description: editingMilestone.description,
        status: editingMilestone.status,
        milestone: parseFloat(editingMilestone.milestone), // Convert back to number
        timeLimitDays: parseInt(editingMilestone.timeLimitDays, 10), // Convert back to number
      };

      await MembershipMilestoneService.updateMilestone(
        editingMilestone._id,
        payload
      );
      toast.success("Milestone updated successfully!");
      setEditingMilestone(null);
      fetchMilestones(); // Refresh list
      fetchStats(); // Refresh stats
    } catch (err) {
      console.error("Error updating milestone:", err);
      toast.error(
        err.message || "Failed to update milestone. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm("Are you sure you want to delete this milestone?")) {
      return;
    }
    setLoading(true); // Set loading while deleting
    try {
      await MembershipMilestoneService.deleteMilestone(milestoneId);
      toast.success("Milestone deleted successfully!");
      fetchMilestones(); // Refresh list
      fetchStats(); // Refresh stats
    } catch (err) {
      console.error("Error deleting milestone:", err);
      toast.error(
        err.message || "Failed to delete milestone. Please try again."
      );
    } finally {
      setLoading(false); // End loading
    }
  };

  if (loading && !milestones.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading milestones...</span>
      </div>
    );
  }

  if (error && !milestones.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-600">
        <p>{error}</p>
      </div>
    );
  }

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
                  <Label htmlFor="milestone-name" className="sm:text-right">
                    Milestone Name
                  </Label>
                  <Input
                    id="milestone-name"
                    value={newMilestone.name}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="sm:col-span-3"
                    placeholder="e.g., Diamond Member"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="milestone-value" className="sm:text-right">
                    Milestone Value
                  </Label>
                  <Input
                    id="milestone-value"
                    type="number"
                    value={newMilestone.milestone}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        milestone: parseFloat(e.target.value),
                      }))
                    }
                    className="sm:col-span-3"
                    placeholder="e.g., 500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="reward-amount" className="sm:text-right">
                    Reward Amount
                  </Label>
                  <Input
                    id="reward-amount"
                    type="number"
                    value={newMilestone.rewardAmount}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        rewardAmount: parseFloat(e.target.value),
                      }))
                    }
                    className="sm:col-span-3"
                    placeholder="e.g., 500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="sm:text-right">
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
                    className="sm:col-span-3"
                    placeholder="Brief description of the milestone"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="timeLimitDays" className="sm:text-right">
                    Time Limit (Days)
                  </Label>
                  <Input
                    id="timeLimitDays"
                    type="number"
                    value={newMilestone.timeLimitDays}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        timeLimitDays: parseInt(e.target.value, 10),
                      }))
                    }
                    className="sm:col-span-3"
                    placeholder="e.g., 30 (optional)"
                  />
                </div>
                {/* Status can be a dropdown if you want to allow selection */}
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="sm:text-right">
                    Status
                  </Label>
                  <select
                    id="status"
                    value={newMilestone.status}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="sm:col-span-3 p-2 border rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateMilestone} className="w-full sm:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
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
                {stats?.totalMilestones !== undefined ? stats.totalMilestones : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalActiveMilestones !== undefined
                  ? stats.totalActiveMilestones
                  : "N/A"}{" "}
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
                {stats?.totalUsersAchieved !== undefined
                  ? stats.totalUsersAchieved.toLocaleString()
                  : "N/A"}
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
                $
                {stats?.totalRewardsDistributed !== undefined
                  ? stats.totalRewardsDistributed.toLocaleString()
                  : "N/A"}
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
                    <TableHead>Milestone Name</TableHead>
                    <TableHead>Milestone Value</TableHead>
                    <TableHead>Reward Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMilestones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No milestones found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMilestones.map((milestone) => (
                      <TableRow key={milestone._id}>
                        <TableCell className="font-medium">
                          {milestone.milestoneId || "N/A"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {milestone.name}
                        </TableCell>
                        <TableCell>{milestone.milestone}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          ${milestone.rewardAmount}
                        </TableCell>
                        <TableCell>{milestone.description}</TableCell>
                        <TableCell>{getStatusBadge(milestone.status)}</TableCell>
                        <TableCell>
                          {new Date(milestone.createdAt).toLocaleDateString()}
                        </TableCell>
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
                              onClick={() => handleDeleteMilestone(milestone._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                  <Label htmlFor="edit-name" className="text-right">
                    Milestone Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={editingMilestone.name}
                    onChange={(e) =>
                      setEditingMilestone((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-milestone-value" className="text-right">
                    Milestone Value
                  </Label>
                  <Input
                    id="edit-milestone-value"
                    type="number"
                    value={editingMilestone.milestone}
                    onChange={(e) =>
                      setEditingMilestone((prev) => ({
                        ...prev,
                        milestone: parseFloat(e.target.value),
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-reward-amount" className="text-right">
                    Reward Amount
                  </Label>
                  <Input
                    id="edit-reward-amount"
                    type="number"
                    value={editingMilestone.rewardAmount}
                    onChange={(e) =>
                      setEditingMilestone((prev) => ({
                        ...prev,
                        rewardAmount: parseFloat(e.target.value),
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="edit-description"
                    value={editingMilestone.description || ""}
                    onChange={(e) =>
                      setEditingMilestone((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-timeLimitDays" className="text-right">
                    Time Limit (Days)
                  </Label>
                  <Input
                    id="edit-timeLimitDays"
                    type="number"
                    value={editingMilestone.timeLimitDays || 0}
                    onChange={(e) =>
                      setEditingMilestone((prev) => ({
                        ...prev,
                        timeLimitDays: parseInt(e.target.value, 10),
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                {/* Status can be a dropdown for editing as well */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <select
                    id="edit-status"
                    value={editingMilestone.status}
                    onChange={(e) =>
                      setEditingMilestone((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="col-span-3 p-2 border rounded-md"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleUpdateMilestone} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Update Milestone"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}