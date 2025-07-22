import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Database,
  Settings,
  Share,
  Shield,
  Cookie,
  UserCheck,
  Clock,
  Baby,
  RefreshCw,
  Phone,
} from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      id: "collection",
      title: "Information We Collect",
      icon: <Database className="h-5 w-5" />,
      content: [
        "Account Information: Name, email address, phone number, password, address, business details, etc.",
        "Transaction Data: Orders, payments, returns, shipping details.",
        "Technical Data: IP address, browser type, device information, and cookies.",
        "Usage Data: Pages viewed, time spent, clicks, preferences, and interactions on the platform.",
      ],
    },
    {
      id: "usage",
      title: "How We Use Your Information",
      icon: <Settings className="h-5 w-5" />,
      content: [
        "To create and manage user accounts",
        "To process orders and transactions",
        "To provide customer support",
        "To improve and personalize your user experience",
        "For marketing, promotions, and service updates (with your consent)",
        "To prevent fraud and ensure platform security",
        "To comply with legal obligations",
      ],
    },
    {
      id: "sharing",
      title: "Sharing Your Information",
      icon: <Share className="h-5 w-5" />,
      content: [
        "Third-party service providers (e.g., payment gateways, shipping partners)",
        "Law enforcement or government bodies, if legally required",
        "Technology partners for analytics and platform optimization",
      ],
      note: "All partners are contractually obligated to protect your information.",
    },
    {
      id: "security",
      title: "Data Security",
      icon: <Shield className="h-5 w-5" />,
      content: [
        "Secure servers and firewalls",
        "Encrypted transactions (SSL)",
        "Restricted access to sensitive data",
      ],
      note: "However, no system is 100% secure. Use the platform at your own discretion.",
    },
    {
      id: "cookies",
      title: "Cookies and Tracking",
      icon: <Cookie className="h-5 w-5" />,
      content: [
        "Save user preferences",
        "Track website usage",
        "Analyze performance for improvement",
      ],
      note: "You may choose to disable cookies through your browser settings, but this may affect some features.",
    },
    {
      id: "rights",
      title: "Your Rights",
      icon: <UserCheck className="h-5 w-5" />,
      content: [
        "Access or update your personal data",
        "Request deletion of your account",
        "Opt out of marketing emails and SMS",
        "Withdraw consent (where applicable)",
        "File a complaint if you believe your data rights are violated",
      ],
    },
    {
      id: "retention",
      title: "Data Retention",
      icon: <Clock className="h-5 w-5" />,
      content: [
        "We retain your data only as long as necessary to fulfill the purposes above or as required by law. Inactive accounts may be deleted after a certain period.",
      ],
    },
    {
      id: "children",
      title: "Children's Privacy",
      icon: <Baby className="h-5 w-5" />,
      content: [
        "Our services are not intended for children under 18. We do not knowingly collect data from minors.",
      ],
    },
    {
      id: "policy-changes",
      title: "Changes to This Policy",
      icon: <RefreshCw className="h-5 w-5" />,
      content: [
        "We may update this Privacy Policy from time to time. The latest version will always be posted on our website. We recommend reviewing it periodically.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Effective Date */}
        <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-teal-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="outline" className="text-lg px-4 py-2 mb-4">
                Effective Date: [Insert Date]
              </Badge>
              <p className="text-gray-700 leading-relaxed">
                At Shree Labh Enterprises, we are committed to protecting your privacy
                and handling your personal data with care. This Privacy Policy
                explains how we collect, use, disclose, and protect your
                information when you use our platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Sections */}
        <div className="space-y-6 mb-8">
          {sections.map((section, index) => (
            <Card
              key={section.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full text-green-600">
                    {index + 1}
                  </div>
                  {section.icon}
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {section.title === "Sharing Your Information" && (
                  <p className="text-gray-700 mb-4 font-medium">
                    We do not sell your personal information. We may share your
                    data with:
                  </p>
                )}
                {section.title === "Data Security" && (
                  <p className="text-gray-700 mb-4">
                    We implement industry-standard security measures to protect
                    your data:
                  </p>
                )}
                {section.title === "Cookies and Tracking" && (
                  <p className="text-gray-700 mb-4">We use cookies to:</p>
                )}
                {section.title === "Your Rights" && (
                  <p className="text-gray-700 mb-4">You have the right to:</p>
                )}

                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                {section.note && (
                  <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-gray-700 text-sm italic">
                      {section.note}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Separator className="mb-6" />
          <p className="text-gray-500 text-sm">
            Your privacy is important to us. We are committed to protecting your
            personal information and being transparent about our data practices.
          </p>
        </div>
      </div>
    </div>
  );
}
