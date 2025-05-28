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
  CreditCard,
  TrendingUp,
  DollarSign,
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

const cashbackMilestonesData = [
  {
    id: "CB001",
    milestone: "First Purchase Cashback",
    reward: "$5",
    description: "Cashback for making first purchase on platform",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 2340,
    threshold: "First purchase",
    percentage: "2%",
  },
  {
    id: "CB002",
    milestone: "Monthly Spender",
    reward: "$15",
    description: "Cashback for spending $500+ in a month",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 1890,
    threshold: "$500/month",
    percentage: "3%",
  },
  {
    id: "CB003",
    milestone: "Bulk Purchase",
    reward: "$25",
    description: "Cashback for single order above $200",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 1456,
    threshold: "$200/order",
    percentage: "5%",
  },
  {
    id: "CB004",
    milestone: "Loyalty Cashback",
    reward: "$50",
    description: "Cashback for 10+ orders in 3 months",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 834,
    threshold: "10 orders/3mo",
    percentage: "7%",
  },
  {
    id: "CB005",
    milestone: "VIP Cashback",
    reward: "$100",
    description: "Cashback for spending $2000+ lifetime",
    status: "Active",
    createdDate: "2024-01-15",
    totalClaimed: 267,
    threshold: "$2000 lifetime",
    percentage: "10%",
  },
  {
    id: "CB006",
    milestone: "Holiday Special",
    reward: "$20",
    description: "Special holiday season cashback",
    status: "Inactive",
    createdDate: "2023-12-01",
    totalClaimed: 1245,
    threshold: "Holiday period",
    percentage: "4%",
  },
];

export default function CashbackMilestonesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [newMilestone, setNewMilestone] = useState({
    milestone: "",
    reward: "",
    threshold: "",
    percentage: "",
    description: "",
  });

  const filteredMilestones = cashbackMilestonesData.filter(
    (milestone) =>
      milestone.milestone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      milestone.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      milestone.threshold.toLowerCase().includes(searchTerm.toLowerCase())
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
    console.log("Creating cashback milestone:", newMilestone);
    setIsCreateDialogOpen(false);
    setNewMilestone({
      milestone: "",
      reward: "",
      threshold: "",
      percentage: "",
      description: "",
    });
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
  };

  const handleUpdateMilestone = () => {
    console.log("Updating cashback milestone:", editingMilestone);
    setEditingMilestone(null);
  };

  const handleDeleteMilestone = (milestoneId) => {
    console.log("Deleting cashback milestone:", milestoneId);
  };

  const totalRewardsDistributed = filteredMilestones.reduce(
    (sum, milestone) => {
      const rewardAmount = parseFloat(milestone.reward.replace("$", ""));
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
      Cashback Milestones
    </h2>
    <p className="text-muted-foreground text-sm sm:text-base">
      Configure cashback rewards based on spending patterns and purchase behavior
    </p>
  </div>

  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
    <DialogTrigger asChild>
      <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
        <Plus className="mr-2 h-4 w-4" />
        Create Cashback Milestone
      </Button>
    </DialogTrigger>

    <DialogContent className="max-w-2xl w-full">
      <DialogHeader>
        <DialogTitle>Create New Cashback Milestone</DialogTitle>
        <DialogDescription>
          Set up a new cashback milestone with spending threshold and reward amount.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {[
          { id: 'milestone', label: 'Milestone Name', placeholder: 'e.g., Premium Spender', value: newMilestone.milestone },
          { id: 'threshold', label: 'Threshold', placeholder: 'e.g., $1000/month', value: newMilestone.threshold },
          { id: 'reward', label: 'Reward Amount', placeholder: 'e.g., $75', value: newMilestone.reward },
          { id: 'percentage', label: 'Cashback %', placeholder: 'e.g., 8%', value: newMilestone.percentage },
          { id: 'description', label: 'Description', placeholder: 'Brief description of the milestone', value: newMilestone.description },
        ].map((field) => (
          <div key={field.id} className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor={field.id} className="sm:text-right">
              {field.label}
            </Label>
            <Input
              id={field.id}
              value={field.value}
              onChange={(e) =>
                setNewMilestone((prev) => ({
                  ...prev,
                  [field.id]: e.target.value,
                }))
              }
              className="sm:col-span-3"
              placeholder={field.placeholder}
            />
          </div>
        ))}
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
                {filteredMilestones.length}
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {filteredMilestones.filter((m) => m.status === "Active").length}{" "}
                active milestones
              </p>
              <Progress value={75} className="mt-3 h-2" />
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
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                ${totalRewardsDistributed.toLocaleString()}
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
                $
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
                    <TableHead>Threshold</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Cashback %</TableHead>
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
                      <TableCell className="font-medium text-green-600">
                        {milestone.reward}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700"
                        >
                          {milestone.percentage}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(milestone.status)}</TableCell>
                      <TableCell className="font-medium">
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Cashback Milestone</DialogTitle>
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
                    Threshold
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
                  <Label htmlFor="edit-percentage" className="text-right">
                    Cashback %
                  </Label>
                  <Input
                    id="edit-percentage"
                    value={editingMilestone.percentage}
                    onChange={(e) =>
                      setEditingMilestone((prev) => ({
                        ...prev,
                        percentage: e.target.value,
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
