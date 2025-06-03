"use client";

import { useState, useEffect } from "react"; // Import useEffect
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CreditCard,
  TrendingUp,
  DollarSign,
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
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Progress } from "../../../components/ui/progress";


import { CashbackMilestoneService } from "../../../../api/cashbackmilestone"; 


import Swal from "sweetalert2";



export default function CashbackMilestonesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null); 
  const [cashbackMilestones, setCashbackMilestones] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [newMilestoneData, setNewMilestoneData] = useState({
    name: "", 
    rewardAmount: "", 
    milestone: "", 
    purchaseValue: "", 
    timeLimitDays: 0, 
    status: "active", 
    // description: "", 
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    rewardAmount: "",
    milestone: "",
    purchaseValue: "",
    timeLimitDays: "",
    status: "",
    description: "", 
  });

  const fetchMilestones = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await CashbackMilestoneService.getAllMilestones();
      setCashbackMilestones(response.data);
    } catch (err) {
      console.error("Failed to fetch cashback milestones:", err);
      setError(err.message || "Could not fetch milestones.");
      setCashbackMilestones([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []); 
  
  const filteredMilestones = cashbackMilestones.filter(
    (milestone) =>
      milestone.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (milestone.description && milestone.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(milestone.milestone).toLowerCase().includes(searchTerm.toLowerCase()) 
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
    try {
      const payload = {
        name: newMilestoneData.name,
        status: newMilestoneData.status,
        milestone: parseInt(newMilestoneData.milestone, 10),
        rewardAmount: parseFloat(newMilestoneData.rewardAmount),
        timeLimitDays: parseInt(newMilestoneData.timeLimitDays, 10) || 0,
        purchaseValue: parseFloat(newMilestoneData.purchaseValue) || 0,
      };

      await CashbackMilestoneService.createMilestone(payload);
      alert("Cashback milestone created successfully!"); 
      setIsCreateDialogOpen(false);
      setNewMilestoneData({
        name: "",
        rewardAmount: "",
        milestone: "",
        purchaseValue: "",
        timeLimitDays: 0,
        status: "active",
        // description: "",
      });
      fetchMilestones(); 
    } catch (err) {
      console.error("Error creating milestone:", err);
      alert(`Failed to create milestone: ${err.errors ? err.errors.join(", ") : err.message}`);
    }
  };

  const handleEditMilestone = (milestone) => {
    
    setEditingMilestone(milestone);
    setEditFormData({
      name: milestone.name,
      rewardAmount: milestone.rewardAmount,
      milestone: milestone.milestone,
      purchaseValue: milestone.purchaseValue,
      timeLimitDays: milestone.timeLimitDays,
      status: milestone.status,
      // description: milestone.description || "", 
    });
  };

const handleUpdateMilestone = async () => {
  try {
    if (!editingMilestone) return;

    const payload = {
      name: editFormData.name,
      status: editFormData.status,
      milestone: parseInt(editFormData.milestone, 10),
      rewardAmount: parseFloat(editFormData.rewardAmount),
      timeLimitDays: parseInt(editFormData.timeLimitDays, 10) || 0,
      purchaseValue: parseFloat(editFormData.purchaseValue) || 0,
    };

    await CashbackMilestoneService.updateMilestone(editingMilestone._id, payload);

    Swal.fire({
      icon: 'success',
      title: 'Updated!',
      text: 'Cashback milestone updated successfully!',
      confirmButtonColor: '#3085d6',
    });

    setEditingMilestone(null);
    fetchMilestones();
  } catch (err) {
    console.error("Error updating milestone:", err);

    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: err?.errors ? err.errors.join(", ") : err.message,
      confirmButtonColor: '#d33',
    });
  }
};


 const handleDeleteMilestone = async (milestoneId) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action will delete the milestone permanently.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (!result.isConfirmed) return;

  try {
    await CashbackMilestoneService.deleteMilestone(milestoneId);

    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Cashback milestone deleted successfully!",
      confirmButtonColor: "#3085d6",
    });

    fetchMilestones();
  } catch (err) {
    console.error("Error deleting milestone:", err);

    Swal.fire({
      icon: "error",
      title: "Delete Failed",
      text: err?.message || "An unexpected error occurred.",
      confirmButtonColor: "#d33",
    });
  }
};

 
  const totalRewardsDistributed = filteredMilestones.reduce(
    (sum, milestone) => sum + (milestone.rewardAmount * (milestone.totalClaimed || 0)), 
    0
  );

  const totalClaims = filteredMilestones.reduce(
    (sum, milestone) => sum + (milestone.totalClaimed || 0), 
    0
  );

  const totalActiveMilestones = filteredMilestones.filter((m) => m.status === "active").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading Cashback Milestones...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div className=" space-y-8 p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Cashback Milestones
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Configure cashback rewards based on spending patterns and purchase
              behavior
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Plus className="mr-2 h-4 w-4" />
                Create Cashback Milestone
              </Button>
            </DialogTrigger>

            <DialogContent className=" w-[50rem]">
              <DialogHeader>
                <DialogTitle>Create New Cashback Milestone</DialogTitle>
                <DialogDescription>
                  Set up a new cashback milestone with spending threshold and
                  reward amount.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {[
                  { id: 'name', label: 'Milestone-Name', placeholder: 'e.g., Premium Spender', value: newMilestoneData.name, type: 'text' },
                  { id: 'milestone', label: 'Milestone Target', placeholder: 'e.g., 1000 (for $1000 spending)', value: newMilestoneData.milestone, type: 'number' },
                  { id: 'rewardAmount', label: 'Reward Amount ', placeholder: 'e.g., 75', value: newMilestoneData.rewardAmount, type: 'number' },
                  { id: 'purchaseValue', label: 'Purchase Value', placeholder: 'e.g., 200 (min purchase for milestone)', value: newMilestoneData.purchaseValue, type: 'number' },
                  { id: 'timeLimitDays', label: 'Time Limit(Days)', placeholder: 'e.g., 30 (0 for no limit)', value: newMilestoneData.timeLimitDays, type: 'number' },
                 
                  { id: 'description', label: 'Description(UIOnly)', placeholder: 'Brief description of the milestone', value: newMilestoneData.description, type: 'text' },
                ].map((field) => (
                  <div key={field.id} className="grid grid-cols-1 justify-between sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor={field.id} className="sm:text-right whitespace-nowrap">
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      type={field.type}
                      value={field.value}
                      onChange={(e) =>
                        setNewMilestoneData((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }))
                      }
                      className="w-[20rem]"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="sm:text-right">
                    Status
                  </Label>
                  <select
                    id="status"
                    value={newMilestoneData.status}
                    onChange={(e) => setNewMilestoneData(prev => ({ ...prev, status: e.target.value }))}
                    className="sm:col-span-3 border rounded-md p-2 h-10"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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

        
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                Total Milestones
              </CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {cashbackMilestones.length}
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {totalActiveMilestones} active milestones
              </p>
              <Progress value={(totalActiveMilestones / cashbackMilestones.length) * 100 || 0} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                Total Claims
              </CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {totalClaims.toLocaleString()}
              </div>
              <p className="text-sm text-green-700 mt-1">
                Cashback rewards claimed
              </p>
              <Progress value={82} className="mt-3 h-2" /> 
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">
                Rewards Distributed
              </CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <IndianRupee className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
              ₹{totalRewardsDistributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-purple-700 mt-1">
                Total cashback paid
              </p>
              <Progress value={68} className="mt-3 h-2" /> 
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">
                Avg. Cashback
              </CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
              ₹
                {totalClaims > 0
                  ? (totalRewardsDistributed / totalClaims).toFixed(2)
                  : "0.00"}
              </div>
              <p className="text-sm text-orange-700 mt-1">Per claim average</p>
              <Progress value={91} className="mt-3 h-2" /> 
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">All Cashback Milestones</CardTitle>
            <CardDescription>
              Manage cashback milestone rewards and track their performance
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
                    <TableHead>Milestone Target</TableHead> 
                    <TableHead>Reward Amount</TableHead>
                    <TableHead>Purchase Value</TableHead> 
                    <TableHead>Time Limit (Days)</TableHead> 
                    <TableHead>Status</TableHead>
                    <TableHead>Total Claimed</TableHead> 
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMilestones.map((milestone) => (
                    <TableRow key={milestone._id}> 
                      <TableCell className="font-medium">
                        {milestone.milestoneId} 
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {milestone.name} 
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {milestone.description || "N/A"} 
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700"
                        >
                          {milestone.milestone} 
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                      ₹{milestone.rewardAmount?.toFixed(2)} 
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700"
                        >
                          ₹{milestone.purchaseValue?.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {milestone.timeLimitDays > 0 ? `${milestone.timeLimitDays} days` : 'No Limit'}
                      </TableCell>
                      <TableCell>{getStatusBadge(milestone.status)}</TableCell>
                      <TableCell className="font-medium">
                        {(milestone.totalClaimed || 0).toLocaleString()} 
                      </TableCell>
                      <TableCell>{new Date(milestone.createdAt).toLocaleDateString()}</TableCell> 
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
                            onClick={() => handleDeleteMilestone(milestone.milestoneId)} 
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
              <DialogTitle>Edit Cashback Milestone</DialogTitle>
              <DialogDescription>
                Update the milestone details and reward configuration.
              </DialogDescription>
            </DialogHeader>
            {editingMilestone && (
              <div className="grid gap-4 py-4">
                {[
                  { id: 'name', label: 'Milestone Name', placeholder: 'e.g., Premium Spender', value: editFormData.name, type: 'text' },
                  { id: 'milestone', label: 'Milestone Target', placeholder: 'e.g., 1000 (for $1000 spending)', value: editFormData.milestone, type: 'number' },
                  { id: 'rewardAmount', label: 'Reward Amount ($)', placeholder: 'e.g., 75', value: editFormData.rewardAmount, type: 'number' },
                  { id: 'purchaseValue', label: 'Purchase Value ($)', placeholder: 'e.g., 200 (min purchase for milestone)', value: editFormData.purchaseValue, type: 'number' },
                  { id: 'timeLimitDays', label: 'Time Limit (Days)', placeholder: 'e.g., 30 (0 for no limit)', value: editFormData.timeLimitDays, type: 'number' },
                  { id: 'description', label: 'Description (UI Only)', placeholder: 'Brief description of the milestone', value: editFormData.description, type: 'text' },
                ].map((field) => (
                  <div key={field.id} className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor={`edit-${field.id}`} className="sm:text-right">
                      {field.label}
                    </Label>
                    <Input
                      id={`edit-${field.id}`}
                      type={field.type}
                      value={field.value}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }))
                      }
                      className="sm:col-span-3"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="sm:text-right">
                    Status
                  </Label>
                  <select
                    id="edit-status"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="sm:col-span-3 border rounded-md p-2 h-10"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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