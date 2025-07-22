import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Clock,
  Shield,
  AlertTriangle,
  Copyright,
  FileText,
  RefreshCw,
} from "lucide-react";

export default function CompanyPolicy() {
  const policyItems = [
    {
      id: "overview",
      title: "Company Overview",
      icon: <Building2 className="h-5 w-5" />,
      content:
        "Shree Labh Enterprises is an eCommerce platform dedicated to empowering online sellers through innovative tools, marketing solutions, and customer support. We are committed to transparency, trust, and growth for both our users and our internal team.",
    },
    {
      id: "conduct",
      title: "Code of Conduct",
      icon: <Users className="h-5 w-5" />,
      content: [
        "All employees and partners must uphold the highest standards of integrity and professionalism.",
        "Discrimination, harassment, or abuse of any kind will not be tolerated.",
        "Confidential company information must not be shared without authorization.",
      ],
    },
    {
      id: "expectations",
      title: "Employee Expectations",
      icon: <FileText className="h-5 w-5" />,
      content: [
        "Be punctual and meet work deadlines.",
        "Maintain clear communication with team members and supervisors.",
        "Represent the company positively in all public interactions.",
      ],
    },
    {
      id: "hours",
      title: "Work Hours and Attendance",
      icon: <Clock className="h-5 w-5" />,
      content: [
        "Standard working hours are [e.g., 9:00 AM – 6:00 PM], Monday to Friday.",
        "Remote and flexible work arrangements are subject to manager approval.",
        "Any leave or absence must be communicated in advance and documented.",
      ],
    },
    {
      id: "resources",
      title: "Use of Company Resources",
      icon: <Shield className="h-5 w-5" />,
      content: [
        "Company property (including computers, tools, software) must be used responsibly.",
        "Internet and communication systems are primarily for work-related purposes.",
        "Data privacy and cybersecurity protocols must be followed at all times.",
      ],
    },
    {
      id: "seller-support",
      title: "Seller Support and Ethics",
      icon: <Users className="h-5 w-5" />,
      content: [
        "Ensure fair treatment of all online sellers using our platform.",
        "Misrepresentation of seller services or favoritism is strictly prohibited.",
        "Feedback from sellers must be addressed promptly and respectfully.",
      ],
    },
    {
      id: "compliance",
      title: "Anti-Fraud & Compliance",
      icon: <AlertTriangle className="h-5 w-5" />,
      content: [
        "Zero tolerance for fraudulent behavior by employees, sellers, or buyers.",
        "Regular audits will be conducted to ensure compliance with legal and internal standards.",
        "Any suspicious activity must be reported to the compliance officer immediately.",
      ],
    },
    {
      id: "ip",
      title: "Intellectual Property",
      icon: <Copyright className="h-5 w-5" />,
      content: [
        "All content created by employees for the company is the property of Shree Labh Enterprises.",
        "Do not use or share copyrighted material without appropriate licenses or permissions.",
      ],
    },
    {
      id: "termination",
      title: "Termination Policy",
      icon: <AlertTriangle className="h-5 w-5" />,
      content: [
        "Employment may be terminated for misconduct, poor performance, or breach of company policies.",
        "Employees will be given appropriate notice and explanation as per labor laws.",
      ],
    },
    {
      id: "updates",
      title: "Policy Updates",
      icon: <RefreshCw className="h-5 w-5" />,
      content:
        "Shree Labh Enterprises reserves the right to modify this policy at any time. Employees will be informed of significant changes in writing.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Shree Labh Enterprises</h1>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Company Policy
          </Badge>
          <p className="text-gray-600 mt-4 text-lg">
            Empowering online sellers through innovation, integrity, and
            excellence
          </p>
        </div>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {policyItems.map((item, index) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-blue-600 font-semibold">
                    {index + 1}.
                  </span>
                  {item.icon}
                  <span className="text-sm">{item.title}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Policy Sections */}
        <div className="space-y-6">
          {policyItems.map((item, index) => (
            <Card key={item.id} id={item.id} className="scroll-mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-bold">
                    {index + 1}
                  </div>
                  {item.icon}
                  <span>{item.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(item.content) ? (
                  <ul className="space-y-3">
                    {item.content.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700 leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {item.content}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Separator className="mb-6" />
          <p className="text-gray-500 text-sm">
            This policy is effective as of the date of publication and
            supersedes all previous versions.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            For questions or clarifications, please contact the HR department.
          </p>
        </div>
      </div>
    </div>
  );
}
