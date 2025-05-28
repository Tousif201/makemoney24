"use client"

import { Gift, Trophy, Target } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function UsersRewardsPage() {
  const rewards = [
    {
      milestone: "First Purchase",
      description: "Complete your first order",
      amount: "₹100",
      date: "2024-03-01",
      status: "Completed",
    },
    {
      milestone: "₹5,000 Monthly Purchase",
      description: "Purchase worth ₹5,000 in a month",
      amount: "₹250",
      date: "2024-03-15",
      status: "Completed",
    },
    {
      milestone: "₹10,000 Monthly Purchase",
      description: "Purchase worth ₹10,000 in a month",
      amount: "₹500",
      date: "2024-03-20",
      status: "Completed",
    },
    {
      milestone: "5 Direct Referrals",
      description: "Get 5 direct referrals to join",
      amount: "₹1,000",
      date: "2024-03-25",
      status: "Completed",
    },
    {
      milestone: "₹25,000 Monthly Purchase",
      description: "Purchase worth ₹25,000 in a month",
      amount: "₹1,500",
      date: "-",
      status: "Pending",
    },
    {
      milestone: "10 Direct Referrals",
      description: "Get 10 direct referrals to join",
      amount: "₹2,500",
      date: "-",
      status: "Pending",
    },
  ]

  const totalEarned = rewards
    .filter((reward) => reward.status === "Completed")
    .reduce((sum, reward) => sum + Number.parseInt(reward.amount.replace("₹", "").replace(",", "")), 0)

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Rewards</h1>
          <p className="text-purple-600">Track your milestone achievements and rewards</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Rewards Earned</CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">₹{totalEarned.toLocaleString()}</div>
            <p className="text-xs text-purple-600">From milestone achievements</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Completed Milestones</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {rewards.filter((r) => r.status === "Completed").length}
            </div>
            <p className="text-xs text-purple-600">Out of {rewards.length} total</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Pending Rewards</CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              ₹
              {rewards
                .filter((r) => r.status === "Pending")
                .reduce((sum, reward) => sum + Number.parseInt(reward.amount.replace("₹", "").replace(",", "")), 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-purple-600">Potential earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Table */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Milestone Rewards</CardTitle>
          <CardDescription className="text-purple-600">Complete milestones to earn bonus rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Milestone</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reward Amount</TableHead>
                <TableHead>Date Achieved</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map((reward, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-purple-900">{reward.milestone}</TableCell>
                  <TableCell className="text-purple-700">{reward.description}</TableCell>
                  <TableCell className="font-medium text-green-600">{reward.amount}</TableCell>
                  <TableCell className="text-purple-700">{reward.date}</TableCell>
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
  )
}
