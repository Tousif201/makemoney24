"use client";

import { useState, useRef, useEffect } from "react";
// import html2pdf from "html2pdf.js";
import * as htmlToImage from 'html-to-image';
import {
  Calendar,
  ChevronLeft,
  Download,
  Search,
  User,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  CreditCard,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import CashbackCardFront from "../../../components/CashbackCardFront";
import CashbackCardBack from "../../../components/CashbackCardBack";
import { fetchUserDetails, fetchUserReferralPerformance } from "../../../../api/auth";
import { fetchUserEmiDetails } from "../../../../api/emi";

import jsPDF from "jspdf";
// import html2canvas from "html2canvas";


function UsersDetailsPageAdmin() {
  const pdfRef = useRef();
  const [userData, setUserData] = useState(null);
  const [referralData, setReferralData] = useState(null);
  const [emiHistory, setEmiHistory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const params = useParams();
  const { id } = params;
  const authToken = localStorage.getItem("token");
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        try {
          const data = await fetchUserDetails(id);
          setUserData(data.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchReferrals = async () => {
      if (id) {
        try {
          const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
          const data = await fetchUserReferralPerformance(id, authToken, formattedDate);
          setReferralData(data.referrals);
        } catch (error) {
          console.error("Error fetching referral data:", error);
        }
      }
    };

    fetchReferrals();
  }, [id, selectedDate, authToken]);

  useEffect(() => {
    const fetchEmiDetails = async () => {
      if (id) {
        try {
          const data = await fetchUserEmiDetails(id);
          console.log("front end emi", data)
          setEmiHistory(data.data.emiDetails);
          console.log(data.data, "Emi History Data");
        } catch (error) {
          console.error("Error fetching EMI history:", error);
        }
      }
    };

    fetchEmiDetails();
  }, [id]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        variant: "default",
        icon: CheckCircle,
        color: "text-green-600",
      },
      inactive: { variant: "secondary", icon: XCircle, color: "text-gray-600" },
      overdue: {
        variant: "destructive",
        icon: AlertCircle,
        color: "text-red-600",
      },
      completed: {
        variant: "outline",
        icon: CheckCircle,
        color: "text-blue-600",
      },
    };

    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMembershipStatusBadge = (status, type) => {
    if (status === "active") {
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {type} - Active
          </Badge>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="secondary" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {type} - Inactive
          </Badge>
        </div>
      );
    }
  };

  const getProfileScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredReferrals = (referralData || []).filter((referral) => {
    const matchesSearch =
      referral.referredUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referredUser.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || (referral.membership && referral.membership.amountPaid ? "active" : "inactive") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [isExporting, setIsExporting] = useState(false);



  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);
  
    try {
      // 📱 Mobile view के लिए longer delay
      await new Promise((resolve) => setTimeout(resolve, 500));
  
      // 🎯 Mobile detection और appropriate settings
      const isMobile = window.innerWidth <= 768;
      
      // 📐 Mobile के लिए higher pixel ratio और better quality
      const pixelRatio = isMobile ? 3 : 2;
      
      // 🖼️ Canvas generation with mobile-optimized settings
      const canvas = await htmlToImage.toCanvas(pdfRef.current, {
        pixelRatio: pixelRatio,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        // 📱 Mobile के लिए specific width/height constraints
        width: isMobile ? pdfRef.current.scrollWidth : undefined,
        height: isMobile ? pdfRef.current.scrollHeight : undefined,
        // 🎨 Better quality for mobile
        quality: 1.0,
      });
  
      const imgData = canvas.toDataURL("image/png", 1.0);
  
      // 📄 PDF configuration - mobile के लिए optimized
      const pdf = new jsPDF({
        unit: "mm",
        format: isMobile ? "a4" : "letter", // Mobile के लिए A4 better है
        orientation: "portrait"
      });
  
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // 🔢 Aspect ratio calculation
      const canvasAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;
      
      let finalWidth, finalHeight, offsetX = 0, offsetY = 0;
      
      // 📏 Mobile के लिए better fitting logic
      if (canvasAspectRatio > pdfAspectRatio) {
        // Canvas is wider - fit to width
        finalWidth = pdfWidth;
        finalHeight = pdfWidth / canvasAspectRatio;
        offsetY = (pdfHeight - finalHeight) / 2;
      } else {
        // Canvas is taller - fit to height
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * canvasAspectRatio;
        offsetX = (pdfWidth - finalWidth) / 2;
      }
  
      // 🖼️ Add image with proper centering
      pdf.addImage(
        imgData, 
        "PNG", 
        offsetX, 
        offsetY, 
        finalWidth, 
        finalHeight,
        undefined,
        'FAST' // Better compression for mobile
      );
  
      // 💾 Create PDF blob
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `cashback_card_${timestamp}.pdf`;
      
      const pdfBlob = new Blob([pdf.output("arraybuffer")], { 
        type: "application/pdf" 
      });
      
      // 📥 Direct download for all devices (mobile + desktop)
      downloadPDF(pdfBlob, filename);
  
    } catch (error) {
      console.error("PDF export failed:", error);
      
      // 🚨 Mobile के लिए user-friendly error message
      if (window.innerWidth <= 768) {
        alert("PDF export problem ! Please tyr again।");
      }
    } finally {
      setIsExporting(false);
    }
  };
  
  // 📥 Helper function for download
  const downloadPDF = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    
    // Cleanup with slight delay for mobile compatibility
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  if (!userData) {
    return <div>Loading user data...</div>;
  }

  if (!referralData) {
    return <div>Loading referral performance...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                User Details
              </h1>
              <p className="text-gray-600">
                Manage user performance and EMI details -{userData.name}
              </p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div onClick={() => console.log(userData)}>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{userData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{userData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{userData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Join Date</p>
                <p className="font-semibold">{new Date(userData.joiningDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Profile Score</p>
                <div className="flex items-center gap-2">
                  <p
                    className={`font-semibold ${getProfileScoreColor(
                      userData.profileScore
                    )}`}
                  >
                    {userData.profileScore}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-600">Total Referrals</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {userData.totalReferrals}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600">
                    Active Referrals
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {userData.activeReferrals}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-purple-600">
                    Total Earnings
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  ₹{userData.totalEarnings?.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Cards */}
        <div className="w-full md:w-auto flex justify-end mb-4">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className={`flex items-center gap-2 ${isExporting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} bg-blue-100 text-black border rounded-sm py-1 px-3`}
          >
            {isExporting ? "Exporting..." : "Export"}
            <Download className="h-4 w-4" />
          </button>
        </div>

        <div ref={pdfRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <Card className="border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors">
            <CardContent  className="p-6">
               <CashbackCardFront />      {/*adding component */}
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-green-200 hover:border-green-400 transition-colors">
            <CardContent className="p-6">
              <CashbackCardBack />           {/*adding component */}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="performance">Daily Performance</TabsTrigger>
            <TabsTrigger value="emi">EMI Details</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Daily Performance
                    </CardTitle>
                    <CardDescription>
                      Referral performance for {formatDate(selectedDate)}
                    </CardDescription>
                  </div>

                  <div className="flex flex-col  items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(selectedDate)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Referrals Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referral User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Membership Status</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Payment Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReferrals.map((referral) => (
                        <TableRow key={referral.referredUser._id}>
                          <TableCell className="font-medium">
                            {referral.referredUser.name}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {referral.referredUser.email}
                          </TableCell>
                          <TableCell>
                            {getMembershipStatusBadge(
                              referral.membership ? "active" : "inactive",
                              referral.membership?.amountPaid ? "Premium" : "Basic"
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{referral.membership?.amountPaid?.toLocaleString() || '-'}
                          </TableCell>
                          <TableCell>{referral.membership?.purchasedAt ? new Date(referral.membership.purchasedAt).toLocaleDateString() : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredReferrals.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No referrals found for the selected criteria.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* EMI Tab */}
          <TabsContent value="emi" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  EMI Payment Details
                </CardTitle>
                <CardDescription>
                  Track all EMI payments, schedules, and outstanding amounts
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Type</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Paid Amount</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead>Monthly EMI</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Next Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Overdue Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(emiHistory) ? emiHistory.map((emi) => (
                        <TableRow key={emi._id}>
                          <TableCell className="font-medium">
                            {emi.orderId ? 'Order ID: ' + emi.orderId : 'N/A'}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{emi.totalAmount?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-green-600">
                            ₹{emi.paidInstallments * emi.installmentAmount?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-red-600">
                            ₹{emi.remainingAmount?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ₹{emi.installmentAmount?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${(emi.paidInstallments /
                                      emi.totalInstallments) *
                                      100
                                      }%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {emi.paidInstallments}/{emi.totalInstallments}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {emi.nextDueDate ? (
                              <div className="text-sm">
                                <p className="font-medium">
                                  {new Date(emi.nextDueDate).toLocaleDateString()}
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-400">Completed</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(emi.status)}</TableCell>
                          <TableCell className="text-red-700 font-semibold">
                            {emi.overdueAmount > 0 ? `₹${emi.overdueAmount.toLocaleString()}` : '-'}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-4">No EMI data available</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-600">Active EMIs</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {emiHistory?.filter((emi) => emi.status === "ongoing").length || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-600">Overdue</span>
                    </div>
                    <p className="text-2xl font-bold text-red-700">
                      {emiHistory?.filter((emi) => emi.status === "defaulted").length || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-600">
                        Total Outstanding
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      ₹
                      {emiHistory
                        ?.reduce((sum, emi) => sum + (emi.totalAmount - (emi.paidInstallments * emi.installmentAmount)), 0)
                        ?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default UsersDetailsPageAdmin;