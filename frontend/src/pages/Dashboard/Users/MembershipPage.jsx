import { Calendar, Check, CreditCard, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MembershipPage() {
  const isMember = true; // This would come from your user data

  const benefits = [
    "PayLater options on orders above ₹500",
    "No cost EMI on PayLater purchases",
    "Priority customer support",
    "Exclusive member-only deals",
    "Higher commission rates on referrals",
    "Early access to new products",
  ];

  if (!isMember) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">
              Become a Member
            </h1>
            <p className="text-purple-600">
              Unlock exclusive benefits and features
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-purple-200">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-purple-900">
                Premium Membership
              </CardTitle>
              <CardDescription className="text-purple-600">
                Join our exclusive membership program and enjoy premium benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-900">₹1,200</div>
                <p className="text-purple-600">One-time payment</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-purple-900">
                  What you'll get:
                </h3>
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-purple-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Become a Member Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">My Membership</h1>
          <p className="text-purple-600">Your membership status and benefits</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-900">
                Membership Status
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-purple-900">
                  Premium Member
                </h3>
                <p className="text-sm text-purple-600">All benefits unlocked</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-purple-700">Member Since:</span>
                <span className="font-medium text-purple-900">
                  March 15, 2024
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Payment Amount:</span>
                <span className="font-medium text-purple-900">₹1,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Payment Date:</span>
                <span className="font-medium text-purple-900">
                  March 15, 2024
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Payment Method:</span>
                <span className="font-medium text-purple-900">UPI</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900">Member Benefits</CardTitle>
            <CardDescription className="text-purple-600">
              Exclusive perks available to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-purple-700">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">
                    Membership Payment
                  </p>
                  <p className="text-sm text-purple-600">March 15, 2024</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-purple-900">₹1,200</p>
                <Badge
                  variant="outline"
                  className="text-green-700 border-green-200"
                >
                  Completed
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
