"use client";

import { Copy, Users } from "lucide-react";
import { useState, useEffect } from "react"; // Import useEffect

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSession } from "../../../context/SessionContext";
// Make sure this path is correct for your API function
import { getreferralLevelDataApi } from "../../../../api/referral";

export default function ReferralsPage() {
  const [currentPage, setCurrentPage] = useState(1); // Keep if you plan to implement pagination
  const { loading: sessionLoading, session, user } = useSession(); // Renamed loading to sessionLoading
  const [referralLevelData, setReferralLevelData] = useState(null); // State for fetched data
  const [dataLoading, setDataLoading] = useState(true); // Loading state for API call
  const [error, setError] = useState(null); // Error state for API call

  // Fetch referral level data when session is loaded and user ID is available
  useEffect(() => {
    const fetchReferralData = async () => {
      if (!sessionLoading && session?.id) {
        try {
          setDataLoading(true); // Start loading for data fetch
          setError(null); // Clear previous errors
          const response = await getreferralLevelDataApi(session.id);
          // Assuming API returns { success: true, data: { level1: {...}, ... } }
          setReferralLevelData(response.data);
        } catch (err) {
          console.error("Failed to fetch referral level data:", err);
          setError("Failed to load referral data. Please try again.");
        } finally {
          setDataLoading(false); // End loading
        }
      } else if (!sessionLoading && !session?.id) {
        // If session is loaded but no userId (e.g., not logged in)
        setDataLoading(false);
        setError("Please log in to view your referral network.");
      }
    };

    fetchReferralData();
  }, [sessionLoading, session?.id]); // Dependencies: re-run when session loading status or userId changes

  const referralCode = user?.referralCode || "Loading..."; // Handle loading state for referralCode

  const copyReferralCode = () => {
    if (referralCode && referralCode !== "Loading...") {
      navigator.clipboard.writeText(referralCode);
      // Optionally add a toast notification here
    }
  };

  const renderUserTable = (users) => {
    if (!users || users.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No referrals found for this level.
        </div>
      );
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Revenue Generated</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={user.name || index}> {/* Use user.name as key if available, else index */}
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.joinDate}</TableCell>
              <TableCell className="text-green-600 font-medium">
                {user.revenue}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    user.status === "Active"
                      ? "text-green-700 border-green-200 bg-green-50"
                      : "text-red-700 border-red-200 bg-red-50" // Assuming inactive status
                  }
                >
                  {user.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // --- Overall Loading and Error States ---
  if (sessionLoading || dataLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-xl text-gray-700">
        Loading referral data...
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

  // If no referralLevelData or no levels in it, display a message
  if (!referralLevelData || Object.keys(referralLevelData).length === 0) {
    return (
      <div className="flex-1 space-y-6 p-6">
         <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold ">Referrals</h1>
              <p className="text-gray-500">
                Track your referral network and earnings
              </p>
            </div>
          </div>
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="">Your Referral Code</CardTitle>
              <CardDescription className="">
                Share this code with friends to earn commissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <code className="text-lg font-mono ">{referralCode}</code>
                </div>
                <Button
                  onClick={copyReferralCode}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        <div className="text-center py-16 text-gray-700 text-lg">
          No referral network found yet. Start sharing your code!
        </div>
      </div>
    );
  }

  // Use the fetched data for rendering
  const levels = Object.keys(referralLevelData).sort((a, b) => {
    const levelNumA = parseInt(a.replace('level', ''));
    const levelNumB = parseInt(b.replace('level', ''));
    return levelNumA - levelNumB;
  });


  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold ">Referrals</h1>
          <p className="text-gray-500">
            Track your referral network and earnings
          </p>
        </div>
      </div>

      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="">Your Referral Code</CardTitle>
          <CardDescription className="">
            Share this code with friends to earn commissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <code className="text-lg font-mono ">{referralCode}</code>
            </div>
            <Button
              onClick={copyReferralCode}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {levels.map((levelKey, index) => {
          const data = referralLevelData[levelKey];
          return (
            <Card key={levelKey} className="border-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Level {index + 1} ({data.commission})
                </CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.users ? data.users.length : 0}
                </div>
                <p className="text-xs">Active referrals</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="">Referral Network</CardTitle>
          <CardDescription className="">
            View your multi-level referral structure and earnings
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          {/* Ensure default value matches one of your tabs */}
          <Tabs defaultValue={levels[0] || "level1"} className="w-full">
            <TabsList className="grid w-full mb-4 md:grid-cols-4 grid-cols-2 gap-1.5 bg-purple-100">
              {levels.map((levelKey, index) => {
                const data = referralLevelData[levelKey];
                return (
                  <TabsTrigger key={levelKey} value={levelKey}>
                    Level {index + 1} ({data.commission})
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {levels.map((levelKey, index) => {
              const data = referralLevelData[levelKey];
              return (
                <TabsContent key={levelKey} value={levelKey} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold mt-5 sm:mt-5 md:mt-0">
                      Level {index + 1} Referrals
                      {index === 0 && " (Direct Referrals)"} {/* Add direct referrals label for level 1 */}
                    </h3>
                    <Badge className="bg-purple-400 mt-7 md:mt-0 sm:mt-4">
                      {data.commission} Commission
                    </Badge>
                  </div>
                  {renderUserTable(data.users)}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
