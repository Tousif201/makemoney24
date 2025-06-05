"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  IndianRupee,
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
import {
  CreateFranchiseMilestone,
  deleteFranchiseMilestone,
  getFranchiseMilestone,
  updateFranchiseMilestone,
   getFranchiseMilestoneStats 
} from "../../../../api/franchisemilestone";
import { toast } from "react-hot-toast"; // Optional: For notifications



export default function FranchiseMilestonesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [franchiseMilestones, setFranchiseMilestones] = useState([]);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [milestoneStats, setMilestoneStats] = useState(null);

  
  const [formData, setFormData] = useState({
    name: "",
    milestone: "",
    status: "active",
    rewardAmount: "",
    timeLimitDays: "",
  });

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Note: this was originally for categories, but your data has no "category" field.
  // We'll remove its usage for timeLimitDays.
  // const getCategoryBadge = (category) => { ... };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      const result = await CreateFranchiseMilestone(payload);
      // console.log("consoling frontend response", result);
      toast.success("Franchise Milestone created successfully");

      // Clear form and close dialog
      setFormData({
        name: "",
        milestone: "",
        status: "active",
        rewardAmount: "",
        timeLimitDays: "",
      });
      setIsCreateDialogOpen(false);
      // Optionally, refetch the list here:
      getFranchiseMilestone()
        .then((data) => {
          const arr = data.data || [];
          setFranchiseMilestones(arr);
        })
        .catch((err) => console.error(err));
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to create milestone");
    }
  };

  useEffect(() => {
    getFranchiseMilestone()
      .then((data) => {
        const arr = data.data || [];
        setFranchiseMilestones(arr);
        // console.log("frontend data", arr);
      })
      .catch((err) =>
        console.error("franchise milestone fetch error:", err.message)
      );
  }, []);

  const filteredMilestones = Array.isArray(franchiseMilestones)
    ? franchiseMilestones.filter((milestone) => {
      const search = searchTerm.toLowerCase();
      // milestone.milestone is a number => convert to string
      const milestoneStr = milestone.milestone
        ?.toString()
        .toLowerCase() || "";
      // If you had a name filter:
      const nameStr = milestone.name?.toLowerCase() || "";
      return (
        milestoneStr.includes(search) ||
        nameStr.includes(search)
      );
    })
    : [];

  // Calculate totalRewardsDistributed and totalClaims
  const totalRewardsDistributed = filteredMilestones.reduce((sum, m) => {
    const rewardAmt = m.rewardAmount || 0; // number already
    const totalClaimed = m.totalClaimed || 0; // absent in your data, default 0
    return sum + rewardAmt * totalClaimed;
  }, 0);

  const totalClaims = filteredMilestones.reduce((sum, m) => {
    return sum + (m.totalClaimed || 0);
  }, 0);

  // const handleEditMilestone = (milestone) => {
  //   setEditingMilestone(milestone);
  // };
  const handleEditMilestone = (milestone) => {
    // console.log("handleEditMilestone called with:", milestone);
    setEditingMilestone(milestone);
  };
  
// after fetching milestone list

  

   
    // … other hooks …

    const handleUpdateMilestone = async () => {
      // console.log("hello")
      // console.log(editingMilestone)
      if (!editingMilestone) return;

      // Destructure fields you want to submit
      const {
        milestoneId,
        name,
        status,
        milestone: targetValue,
        rewardAmount,
        timeLimitDays,
      } = editingMilestone;

      try {
        // Build payload. Only include the five editable fields:
        const payload = {
          name,
          status,
          milestone: targetValue,
          rewardAmount,
          timeLimitDays,
        };

        // Call your API helper
        const result = await updateFranchiseMilestone(milestoneId, payload);

        if (result.success) {
          toast.success("Milestone updated successfully");

          // Replace the updated item in local state so table re-renders
          setFranchiseMilestones((prevArray) =>
            prevArray.map((m) =>
              m.milestoneId === milestoneId ? result.data : m
            )
          );
        } else {
          // In case your backend returns success: false
          toast.error(result.message || "Failed to update milestone");
        }
      } catch (err) {
        console.error("Update error:", err);
        toast.error(err?.message || "Server error when updating milestone");
      } finally {
        // Close the edit dialog
        setEditingMilestone(null);
      }
    };

    const handleDeleteMilestone = async (milestoneId) => {
      try {
        // console.log("Deleting franchise milestone:", milestoneId);
        const result = await deleteFranchiseMilestone(milestoneId);

        if (result.success) {
          toast.success(result.message);
          // Optionally, remove that one from your local state so the table updates immediately:
          setFranchiseMilestones((prev) =>
            prev.filter((m) => m.milestoneId !== milestoneId)
          );
        } else {
          toast.error(result.message);
        }
      } catch (err) {
        console.error("Delete error:", err);
        toast.error(err?.message || "Failed to delete milestone");
      }
    };
getFranchiseMilestoneStats()
  .then((res) => {
    setMilestoneStats(res.data);
    console.log(res)
  })
  .catch((err) => {
    console.error("Failed to fetch milestone stats:", err.message);
  });
    return (
      <div>
        <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-background to-muted/20">
          {/* Header + Create Dialog */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Franchise Milestones
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Configure achievement rewards for franchise partners based on
                performance and growth
              </p>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Franchise Milestone
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl w-full">
                <DialogHeader>
                  <DialogTitle>Create New Franchise Milestone</DialogTitle>
                  <DialogDescription>
                    Set up a new achievement milestone for franchise partners with
                    specific targets and rewards.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter name"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="milestone">Milestone</Label>
                        <Input
                          id="milestone"
                          type="number"
                          value={formData.milestone}
                          onChange={(e) =>
                            setFormData({ ...formData, milestone: e.target.value })
                          }
                          placeholder="e.g. 10"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="rewardAmount">Reward Amount</Label>
                        <Input
                          id="rewardAmount"
                          type="number"
                          value={formData.rewardAmount}
                          onChange={(e) =>
                            setFormData({ ...formData, rewardAmount: e.target.value })
                          }
                          placeholder="e.g. 1000"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 py-2">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="timeLimitDays">Time Limit Days</Label>
                        <Input
                          id="timeLimitDays"
                          type="number"
                          value={formData.timeLimitDays}
                          onChange={(e) =>
                            setFormData({ ...formData, timeLimitDays: e.target.value })
                          }
                          placeholder="e.g. 30"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                          id="status"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="w-full mt-4">
                    <div className="flex w-full justify-between items-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-purple-700 hover:bg-purple-500">
                        Create Milestone
                      </Button>
                    </div>
                  </DialogFooter>
                </form>
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
                  {
                    filteredMilestones.filter((m) => m.status.toLowerCase() === "active")
                      .length
                  }{" "}
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
      <IndianRupee className="h-4 w-4 text-white" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-blue-900">
      ₹
      {milestoneStats?.totalRewardPaid
        ? milestoneStats.totalRewardPaid.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })
        : 0}
    </div>
    <p className="text-sm text-blue-700 mt-1">Total rewards distributed</p>
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
      ₹
      {milestoneStats?.averageRewardPaidPerEntry
        ? milestoneStats.averageRewardPaidPerEntry.toFixed(0)
        : 0}
    </div>
    <p className="text-sm text-purple-700 mt-1">Per achievement</p>
    <Progress value={65} className="mt-3 h-2" />
  </CardContent>
</Card>

          </div>

          {/* Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">All Franchise Milestones</CardTitle>
              <CardDescription>
                Manage franchise achievement milestones and track performance
                rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search Input */}
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
                      <TableHead>Name</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Reward Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time Limit Days</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMilestones.map((m) => (
                      <TableRow key={m.milestoneId}>
                        <TableCell className="font-medium">
                          {m.milestoneId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{m.name}</div>
                            {/* If you had a description, show it here */}
                            {/* <div className="text-sm text-muted-foreground">
                            {m.description}
                          </div> */}
                          </div>
                        </TableCell>
                        <TableCell>{m.milestone}</TableCell>
                        <TableCell>₹{m.rewardAmount}</TableCell>
                        <TableCell>{getStatusBadge(m.status)}</TableCell>
                        <TableCell>{m.timeLimitDays}</TableCell>
                        <TableCell>{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMilestone(m)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMilestone(m.milestoneId)}
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
                  {/* Name */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">
                      Name
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
                      placeholder="Milestone Name"
                    />
                  </div>

                  {/* Target (milestone) */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-milestone" className="text-right">
                      Target
                    </Label>
                    <Input
                      id="edit-milestone"
                      type="number"
                      value={editingMilestone.milestone}
                      onChange={(e) =>
                        setEditingMilestone((prev) => ({
                          ...prev,
                          milestone: e.target.value,
                        }))
                      }
                      className="col-span-3"
                      placeholder="e.g. 100"
                    />
                  </div>

                  {/* Reward Amount */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-rewardAmount" className="text-right">
                      Reward Amount
                    </Label>
                    <Input
                      id="edit-rewardAmount"
                      type="number"
                      value={editingMilestone.rewardAmount}
                      onChange={(e) =>
                        setEditingMilestone((prev) => ({
                          ...prev,
                          rewardAmount: e.target.value,
                        }))
                      }
                      className="col-span-3"
                      placeholder="e.g. 1000"
                    />
                  </div>

                  {/* Status */}
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
                      className="col-span-3 border rounded px-2 py-1"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Time Limit Days */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-timeLimitDays" className="text-right">
                      Time Limit Days
                    </Label>
                    <Input
                      id="edit-timeLimitDays"
                      type="number"
                      value={editingMilestone.timeLimitDays}
                      onChange={(e) =>
                        setEditingMilestone((prev) => ({
                          ...prev,
                          timeLimitDays: e.target.value,
                        }))
                      }
                      className="col-span-3"
                      placeholder="e.g. 30"
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
