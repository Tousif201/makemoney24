"use client";
import { Copy, Users } from "lucide-react";
import { useState, useEffect } from "react";
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
import { getreferralLevelDataApi } from "../../../../api/referral";

export default function ReferralsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { loading: sessionLoading, session, user } = useSession();
  const [referralLevelData, setReferralLevelData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!sessionLoading && session?.id) {
        try {
          setDataLoading(true);
          setError(null);
          const response = await getreferralLevelDataApi(session.id);
          setReferralLevelData(response.data);
        } catch (err) {
          console.error("Failed to fetch referral level data:", err);
          setError("Failed to load referral data. Please try again.");
        } finally {
          setDataLoading(false);
        }
      } else if (!sessionLoading && !session?.id) {
        setDataLoading(false);
        setError("Please log in to view your referral network.");
      }
    };
    fetchReferralData();
  }, [sessionLoading, session?.id]);

  const referralCode = user?.referralCode || "Loading...";

  const copyReferralCode = () => {
    if (referralCode && referralCode !== "Loading...") {
      navigator.clipboard.writeText(referralCode);
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
            <TableRow key={user.name || index}>
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
                      : "text-red-700 border-red-200 bg-red-50"
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

  if (!referralLevelData || Object.keys(referralLevelData).length === 0) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Referrals</h1>
            <p className="text-gray-500">
              Track your referral network and earnings
            </p>
          </div>
        </div>
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>
              Share this code with friends to earn commissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <code className="text-lg font-mono">{referralCode}</code>
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

  // Define the levels you want to display
  const levels = ['level1', 'level2', 'level3', 'level4', 'level5', 'level6'];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Referrals</h1>
          <p className="text-gray-500">
            Track your referral network and earnings
          </p>
        </div>
      </div>
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>
            Share this code with friends to earn commissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <code className="text-lg font-mono">{referralCode}</code>
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {levels.map((levelKey, index) => {
          const data = referralLevelData[levelKey] || { commission: `Level ${index + 1}`, users: [] };
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
          <CardTitle>Referral Network</CardTitle>
          <CardDescription>
            View your multi-level referral structure and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={levels[0]} className="w-full">
            <TabsList className="grid w-full mb-4 md:grid-cols-6 grid-cols-2 gap-1.5 bg-purple-100">
              {levels.map((levelKey, index) => {
                const data = referralLevelData[levelKey] || { commission: `Level ${index + 1}` };
                return (
                  <TabsTrigger key={levelKey} value={levelKey}>
                    Level {index + 1} ({data.commission})
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {levels.map((levelKey, index) => {
              const data = referralLevelData[levelKey] || { users: [] };
              return (
                <TabsContent key={levelKey} value={levelKey} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold mt-15 sm:mt-5 md:mt-0">
                      Level {index + 1} Referrals
                      {index === 0 && " (Direct Referrals)"}
                    </h3>
                    <Badge className="bg-purple-400 mt-7 md:mt-0 sm:mt-4">
                      {data.commission || `Level ${index + 1}`} Commission
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
