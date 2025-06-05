import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Globe,
  AlertTriangle,
} from "lucide-react";

export default function BusinessPlan() {
  const sections = [
    {
      id: "objective",
      title: "Business Objective",
      icon: <Target className="h-5 w-5" />,
      content:
        "To provide a simple, trustworthy, and profitable e-commerce platform that empowers online sellers to easily showcase and sell their products across India.",
      highlight: true,
    },
    {
      id: "services",
      title: "Services & Products Offered",
      icon: <Globe className="h-5 w-5" />,
      content: [
        "Online store setup services",
        "Integrated payment gateway",
        "Digital marketing and ad solutions",
        "Dedicated customer support",
        "Logistics and shipping partnerships",
        "Seller training and workshops",
        "Zero-Interest EMI facility for customers on products ranging from ₹500 to ₹5000",
      ],
    },
    {
      id: "target",
      title: "Target Market",
      icon: <Users className="h-5 w-5" />,
      content: [
        "Micro, Small & Medium Enterprises (MSMEs)",
        "Home-based businesses and women entrepreneurs",
        "Sellers from rural and semi-urban areas",
        "Small-scale sellers on social media platforms",
      ],
    },
    {
      id: "revenue",
      title: "Revenue Model",
      icon: <DollarSign className="h-5 w-5" />,
      content: [
        "Monthly/Annual subscription fees from sellers",
        "Commission on each sale",
        "Paid advertisements and promoted listings",
        "Profit margins on third-party services (e.g., shipping, packaging)",
        "Small service charge from sellers for EMI-enabled sales, while customers pay Zero Interest EMI on ₹500–₹5000 purchases",
      ],
    },
    {
      id: "advantages",
      title: "Competitive Advantages",
      icon: <TrendingUp className="h-5 w-5" />,
      content: [
        "Services available in Marathi and other regional languages",
        "Affordable subscription plans",
        "Fast and easy seller onboarding",
        "Free training and onboarding support",
        "Zero-interest EMI for customers on purchases from ₹500 to ₹5000",
        "Localized marketing and support",
      ],
    },
  ];

  const marketingStrategies = [
    "Social media advertising (Instagram, WhatsApp, Facebook)",
    "Awareness programs in rural areas",
    "Online and offline training for local entrepreneurs",
    "Referral program (Refer & Earn)",
    "YouTube and blog content marketing",
  ];

  const teamStructure = [
    "Founder: [Your Name]",
    "Head of Sales & Marketing",
    "Technology Lead",
    "Customer Support Team",
    "Finance & Legal Advisor",
  ];

  const futurePlans = [
    "Launch dedicated mobile app",
    "Expand services to international sellers",
    "Offer services in more Indian languages",
    "Build in-house logistics network",
    "Develop AI-powered sales analytics tools",
  ];

  const risks = [
    {
      risk: "Technical issues",
      mitigation: "Strong tech team and system backups",
    },
    {
      risk: "Rising competition",
      mitigation: "Local language support, competitive pricing",
    },
    {
      risk: "Seller dissatisfaction",
      mitigation: "24/7 support and continuous training programs",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {sections.map((section, index) => (
            <Card
              key={section.id}
              className={`${
                section.highlight
                  ? "lg:col-span-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
                  : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600">
                    {section.icon}
                  </div>
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(section.content) ? (
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {section.content}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Marketing Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Marketing Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {marketingStrategies.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{strategy}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Team Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-600" />
                Team Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {teamStructure.map((member, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{member}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Financial Projections */}
        <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              Financial Projections (Year 1)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ₹10,00,000
                </div>
                <div className="text-sm text-gray-600">Initial Investment</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Expected Sellers</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">₹2-5L</div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-600">8-10</div>
                <div className="text-sm text-gray-600">Break-even (Months)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Plans */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-indigo-600" />
              Future Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {futurePlans.map((plan, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-700">{plan}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risks and Mitigation */}
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Risks and Mitigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {risks.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg"
                >
                  <div className="flex-1">
                    <Badge variant="destructive" className="mb-2">
                      Risk
                    </Badge>
                    <p className="text-gray-700">{item.risk}</p>
                  </div>
                  <div className="flex-1">
                    <Badge variant="default" className="mb-2">
                      Mitigation
                    </Badge>
                    <p className="text-gray-700">{item.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
