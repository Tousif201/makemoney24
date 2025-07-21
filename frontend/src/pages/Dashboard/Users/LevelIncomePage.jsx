import { TrendingUp, Users, DollarSign, Calendar, IndianRupee } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LevelIncomePage() {
  const monthlyIncome = [
    {
      month: "March 2024",
      level1: 1800,
      level2: 480,
      level3: 120,
      level4: 24,
      total: 2424,
    },
    {
      month: "February 2024",
      level1: 1440,
      level2: 360,
      level3: 60,
      level4: 12,
      total: 1872,
    },
    {
      month: "January 2024",
      level1: 1080,
      level2: 240,
      level3: 60,
      level4: 0,
      total: 1380,
    },
  ];

  const levelStats = [
    {
      level: 1,
      commission: "30%",
      referrals: 5,
      income: 1800,
      color: "bg-green-100 text-green-800",
    },
    {
      level: 2,
      commission: "10%",
      referrals: 3,
      income: 480,
      color: "bg-blue-100 text-blue-800",
    },
    {
      level: 3,
      commission: "5%",
      referrals: 2,
      income: 120,
      color: "bg-purple-100 ",
    },
    {
      level: 4,
      commission: "2%",
      referrals: 1,
      income: 24,
      color: "bg-orange-100 text-orange-800",
    },
  ];

  const totalIncome = monthlyIncome.reduce(
    (sum, month) => sum + month.total,
    0
  );
  const currentMonthIncome = monthlyIncome[0].total;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold ">Level Income</h1>
          <p className="text-gray-500">
            Track your multi-level commission earnings
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ">
              Total Income
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">
              ₹{totalIncome.toLocaleString()}
            </div>
            <p className="text-xs ">All time earnings</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ">
              This Month
            </CardTitle>
            <Calendar className="h-4 w-4  text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">
              ₹{currentMonthIncome.toLocaleString()}
            </div>
            <p className="text-xs ">March 2024 earnings</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ">
              Active Levels
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">4</div>
            <p className="text-xs ">Earning levels</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ">
              Total Referrals
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">
              {levelStats.reduce((sum, level) => sum + level.referrals, 0)}
            </div>
            <p className="text-xs ">Across all levels</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-purple-100">
          <TabsTrigger value="overview">Level Overview</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Level Stats */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="">
                Level-wise Performance
              </CardTitle>
              <CardDescription className="">
                Commission rates and earnings by level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {levelStats.map((level) => (
                  <Card key={level.level} className="border-purple-100">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold ">
                          Level {level.level}
                        </h3>
                        <Badge className={level.color}>
                          {level.commission}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="">Referrals:</span>
                          <span className="font-medium ">
                            {level.referrals}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="">Income:</span>
                          <span className="font-medium text-green-600">
                            ₹{level.income}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          {/* Monthly Income Table */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="">
                Monthly Income Breakdown
              </CardTitle>
              <CardDescription className="">
                Detailed month-wise commission earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Level 1 (30%)</TableHead>
                    <TableHead>Level 2 (10%)</TableHead>
                    <TableHead>Level 3 (5%)</TableHead>
                    <TableHead>Level 4 (2%)</TableHead>
                    <TableHead>Total Income</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyIncome.map((month, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium ">
                        {month.month}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ₹{month.level1}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ₹{month.level2}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ₹{month.level3}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ₹{month.level4}
                      </TableCell>
                      <TableCell className="font-bold ">
                        ₹{month.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
