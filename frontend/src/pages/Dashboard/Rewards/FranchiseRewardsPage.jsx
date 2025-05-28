"use client";

import { Award, Target, Trophy, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function FranchiseRewardsPage() {
  const rewards = [
    {
      milestone: "First 10 Vendors",
      description: "Onboard your first 10 vendors",
      target: 10,
      current: 10,
      amount: "₹5,000",
      date: "2024-03-01",
      status: "Completed",
    },
    {
      milestone: "50 User Referrals",
      description: "Refer 50 users to the platform",
      target: 50,
      current: 50,
      amount: "₹10,000",
      date: "2024-03-10",
      status: "Completed",
    },
    {
      milestone: "₹1,00,000 Monthly Revenue",
      description: "Generate ₹1,00,000 in monthly revenue",
      target: 100000,
      current: 105000,
      amount: "₹15,000",
      date: "2024-03-20",
      status: "Completed",
    },
    {
      milestone: "100 User Referrals",
      description: "Refer 100 users to the platform",
      target: 100,
      current: 100,
      amount: "₹20,000",
      date: "2024-03-25",
      status: "Completed",
    },
    {
      milestone: "25 Active Vendors",
      description: "Maintain 25 active vendors",
      target: 25,
      current: 25,
      amount: "₹12,500",
      date: "2024-03-28",
      status: "Completed",
    },
    {
      milestone: "300 User Referrals",
      description: "Refer 300 users to the platform",
      target: 300,
      current: 280,
      amount: "₹50,000",
      date: "-",
      status: "In Progress",
    },
    {
      milestone: "50 Active Vendors",
      description: "Maintain 50 active vendors",
      target: 50,
      current: 45,
      amount: "₹25,000",
      date: "-",
      status: "In Progress",
    },
    {
      milestone: "₹5,00,000 Total Revenue",
      description: "Generate ₹5,00,000 in total revenue",
      target: 500000,
      current: 420000,
      amount: "₹75,000",
      date: "-",
      status: "In Progress",
    },
  ];

  const completedRewards = rewards.filter((r) => r.status === "Completed");
  const inProgressRewards = rewards.filter((r) => r.status === "In Progress");
  const totalEarned = completedRewards.reduce(
    (sum, reward) =>
      sum + Number.parseInt(reward.amount.replace("₹", "").replace(",", "")),
    0
  );
  const potentialEarnings = inProgressRewards.reduce(
    (sum, reward) =>
      sum + Number.parseInt(reward.amount.replace("₹", "").replace(",", "")),
    0
  );

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Franchise Rewards
          </h1>
          <p className="text-gray-600">
            Track your milestone achievements and franchise rewards
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Rewards Earned
            </CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{totalEarned.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">
              From {completedRewards.length} milestones
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Completed Milestones
            </CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {completedRewards.length}
            </div>
            <p className="text-xs text-gray-600">
              Out of {rewards.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              In Progress
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {inProgressRewards.length}
            </div>
            <p className="text-xs text-gray-600">Active milestones</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Potential Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{potentialEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">From pending milestones</p>
          </CardContent>
        </Card>
      </div>

      {/* In Progress Milestones */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Active Milestones</CardTitle>
          <CardDescription className="text-gray-600">
            Track your progress towards upcoming rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {inProgressRewards.map((reward, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {reward.milestone}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {reward.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {reward.amount}
                    </p>
                    <p className="text-sm text-gray-600">
                      {reward.current.toLocaleString()} /{" "}
                      {reward.target.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Progress
                  value={getProgressPercentage(reward.current, reward.target)}
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {getProgressPercentage(reward.current, reward.target).toFixed(
                    1
                  )}
                  % complete
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Rewards Table */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-gray-900">
            All Milestone Rewards
          </CardTitle>
          <CardDescription className="text-gray-600">
            Complete history of franchise milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Milestone</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Reward Amount</TableHead>
                <TableHead>Date Achieved</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map((reward, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-gray-900">
                    {reward.milestone}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {reward.description}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-700">
                        {reward.current.toLocaleString()} /{" "}
                        {reward.target.toLocaleString()}
                      </div>
                      <Progress
                        value={getProgressPercentage(
                          reward.current,
                          reward.target
                        )}
                        className="h-1 w-20"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {reward.amount}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {reward.date}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        reward.status === "Completed"
                          ? "text-green-700 border-green-200 bg-green-50"
                          : "text-orange-700 border-orange-200 bg-orange-50"
                      }
                    >
                      {reward.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
