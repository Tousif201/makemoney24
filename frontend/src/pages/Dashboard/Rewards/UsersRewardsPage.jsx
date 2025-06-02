"use client";

import { Gift, Trophy, Target } from "lucide-react";
import { useState, useEffect } from "react"; // Import useEffect and useState
import { useSession } from "../../../context/SessionContext"; // Assuming the path to your SessionContext
import { userRewardReport } from "../../../../api/reward"; // Assuming the path to your API function

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

export default function UsersRewardsPage() {
  const { session, loading: sessionLoading, user } = useSession(); // Get session and user from context
  const [rewardData, setRewardData] = useState(null); // State to store fetched reward data
  const [dataLoading, setDataLoading] = useState(true); // Loading state for API call
  const [error, setError] = useState(null); // Error state for API call

  // Effect hook to fetch reward data when the component mounts or user changes
  useEffect(() => {
    const fetchRewardData = async () => {
      // Only fetch if session is loaded and user ID is available
      if (!sessionLoading && user?._id) {
        try {
          setDataLoading(true); // Set loading to true before fetching
          setError(null); // Clear any previous errors

          // Call the API function with the user's MongoDB _id
          const response = await userRewardReport(user._id);
          setRewardData(response); // Store the fetched data in state
        } catch (err) {
          console.error("Error fetching user reward report:", err);
          setError("Failed to load reward data. Please try again."); // Set error message
        } finally {
          setDataLoading(false); // Set loading to false after fetching (success or failure)
        }
      } else if (!sessionLoading && !user?._id) {
        // If session loads but no user ID is found (e.g., not logged in)
        setDataLoading(false);
        setError("Please log in to view your rewards.");
      }
    };

    fetchRewardData(); // Execute the fetch function
  }, [sessionLoading, user?._id]); // Dependencies: re-run effect if session loading status or user._id changes

  // Derived data for display, safely handling null rewardData
  const totalEarned = rewardData?.totalRewardsEarned || 0;
  const completedMilestonesCount = rewardData?.completedMilestones || 0;
  const milestoneRewardsList = rewardData?.MilestoneRewards || [];

  // Helper function to map reward types from the backend to display-friendly strings
  const getRewardDisplayInfo = (type) => {
    switch (type) {
      case "ReferralRewardMilestone":
        return {
          milestone: "Referral Milestone",
          description: "Earned for achieving referral targets.",
        };
      case "FranchiseMilestone":
        return {
          milestone: "Franchise Milestone",
          description: "Achieved as a franchise member.",
        };
      case "CashbackMilestone":
        return {
          milestone: "Cashback Milestone",
          description: "Earned based on cashback accumulation.",
        };
      case "ReferralLevelReward":
        return {
          milestone: "Referral Level Reward",
          description: "Commission for referrals at various levels.",
        };
      case "ProfileScoreAchievementReward":
        return {
          milestone: "ProfileScore Achievement",
          description: "Rewarded for increasing profile score.",
        };
      default:
        return {
          milestone: "Unknown Reward",
          description: "A reward from the system.",
        };
    }
  };

  // --- Conditional Rendering for Loading, Error, and Empty States ---
  if (sessionLoading || dataLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-xl text-gray-700">
        Loading rewards data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-xl text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rewards</h1>
          <p className="text-gray-600">
            Track your milestone achievements and rewards
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
            <p className="text-xs text-gray-600">From milestone achievements</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Completed Milestones
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {completedMilestonesCount}
            </div>
            <p className="text-xs text-gray-600">Total rewards received</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Unique Reward Types
            </CardTitle>{" "}
            {/* Changed title */}
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(milestoneRewardsList.map((reward) => reward.type)).size}{" "}
              {/* Count unique types */}
            </div>
            <p className="text-xs text-gray-600">
              Different types of rewards earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Table */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-gray-900">
            Milestone Rewards History
          </CardTitle>{" "}
          {/* Changed title */}
          <CardDescription className="text-gray-600">
            Track your earned rewards and their details
          </CardDescription>{" "}
          {/* Changed description */}
        </CardHeader>
        <CardContent>
          {milestoneRewardsList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No rewards earned yet. Keep achieving milestones!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reward Type</TableHead> {/* Adjusted header */}
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date Achieved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milestoneRewardsList.map((reward) => {
                  const displayInfo = getRewardDisplayInfo(reward.type);
                  return (
                    <TableRow key={reward._id}>
                      {" "}
                      {/* Use actual _id as key */}
                      <TableCell className="font-medium text-gray-900">
                        {displayInfo.milestone}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {displayInfo.description}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        ₹{reward.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {new Date(reward.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
