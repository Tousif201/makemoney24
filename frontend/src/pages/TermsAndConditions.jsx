import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  User,
  Package,
  CreditCard,
  Truck,
  RefreshCw,
  Shield,
  Copyright,
  AlertTriangle,
  Scale,
  Phone,
} from "lucide-react";

export default function TermsAndConditions() {
  const sections = [
    {
      id: "definitions",
      title: "Definitions",
      icon: <FileText className="h-5 w-5" />,
      content: [
        '"Platform" refers to the Make Money 24 website, app, and all associated services.',
        '"Seller" means a registered business or individual offering products on Make Money 24.',
        '"Customer" refers to a person purchasing products from sellers on the platform.',
        '"We", "Us", "Our" refers to Make Money 24.',
      ],
    },
    {
      id: "registration",
      title: "Account Registration",
      icon: <User className="h-5 w-5" />,
      content: [
        "Sellers and customers must provide accurate and complete information during registration.",
        "You are responsible for maintaining the confidentiality of your login credentials.",
        "We reserve the right to suspend or terminate accounts involved in fraud or policy violations.",
      ],
    },
    {
      id: "listings",
      title: "Product Listings and Pricing",
      icon: <Package className="h-5 w-5" />,
      content: [
        "Sellers are responsible for the accuracy of product listings, images, and pricing.",
        "Make Money 24 is not liable for incorrect product information or disputes between seller and customer.",
        "Products must not violate any applicable laws, regulations, or intellectual property rights.",
      ],
    },
    {
      id: "payments",
      title: "Payments and Fees",
      icon: <CreditCard className="h-5 w-5" />,
      content: [
        "Make Money 24 charges a service fee/commission on every completed sale.",
        "Subscription fees and advertising charges (if applicable) must be paid in full and on time.",
        "EMI options (₹500–₹5000) are available for customers at zero interest, but subject to approval by our payment partner.",
      ],
    },
    {
      id: "shipping",
      title: "Shipping and Delivery",
      icon: <Truck className="h-5 w-5" />,
      content: [
        "Sellers are responsible for timely packaging and shipment of their products.",
        "Make Money 24 may assist with third-party logistics partners but is not liable for delays or damages.",
        "Tracking must be provided to customers.",
      ],
    },
    {
      id: "returns",
      title: "Returns and Refunds",
      icon: <RefreshCw className="h-5 w-5" />,
      content: [
        "Each seller must clearly state their return and refund policy.",
        "Make Money 24 facilitates communication between buyer and seller but does not guarantee refunds unless explicitly stated.",
        "Disputes must be raised within 7 days of delivery.",
      ],
    },
    {
      id: "platform-use",
      title: "Use of Platform",
      icon: <Shield className="h-5 w-5" />,
      content: [
        "Users must not use the platform for illegal, fraudulent, or harmful purposes.",
        "Harassment, hate speech, or spamming is strictly prohibited.",
        "Make Money 24 reserves the right to suspend access without notice in case of policy violations.",
      ],
    },
    {
      id: "ip",
      title: "Intellectual Property",
      icon: <Copyright className="h-5 w-5" />,
      content: [
        "All platform content (logos, designs, software, etc.) is the property of Make Money 24.",
        "Users may not copy, reproduce, or distribute content without written permission.",
      ],
    },
    {
      id: "liability",
      title: "Liability Limitation",
      icon: <AlertTriangle className="h-5 w-5" />,
      content: [
        "Make Money 24 is not responsible for loss of data, profit, or damages caused by use of the platform.",
        "We do not guarantee uninterrupted or error-free access to services.",
      ],
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: <RefreshCw className="h-5 w-5" />,
      content: [
        "Make Money 24 may update these Terms & Conditions from time to time.",
        "Continued use of the platform after changes implies acceptance of the new terms.",
      ],
    },
    {
      id: "governing-law",
      title: "Governing Law",
      icon: <Scale className="h-5 w-5" />,
      content: [
        "These Terms shall be governed by and interpreted under the laws of [Insert Country/State].",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Effective Date */}
        <Card className="mb-8 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="outline" className="text-lg px-4 py-2 mb-4">
                Effective Date: 05-06-2025
              </Badge>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using Make Money 24's services, you agree to be
                bound by the following Terms and Conditions. Please read them
                carefully.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-6 mb-8">
          {sections.map((section, index) => (
            <Card
              key={section.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full text-purple-600">
                    {index + 1}
                  </div>
                  {section.icon}
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

     

        {/* Footer */}
        <div className="mt-12 text-center">
          <Separator className="mb-6" />
          <p className="text-gray-500 text-sm">
            These terms are legally binding. Please ensure you understand all
            provisions before using our services.
          </p>
        </div>
      </div>
    </div>
  );
}
