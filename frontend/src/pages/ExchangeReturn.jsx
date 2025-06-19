
 import React from 'react';
import { ShoppingBag, FileText, Package, Video, AlertTriangle, XCircle, RefreshCw, CreditCard } from 'lucide-react';

export default function ExchangeReturn() {
  const policies = [
    {
      id: 1,
      icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
      title: "Same Day Request",
      description: "Exchange requests must be made on the same day the product is delivered."
    },
    {
      id: 2,
      icon: <FileText className="w-6 h-6 text-green-600" />,
      title: "Valid Documentation",
      description: "A valid invoice or order receipt is required for any exchange."
    },
    {
      id: 3,
      icon: <Package className="w-6 h-6 text-purple-600" />,
      title: "Original Condition",
      description: "The product must be unused and in its original packaging."
    },
    {
      id: 4,
      icon: <Video className="w-6 h-6 text-red-600" />,
      title: "Unboxing Video Required",
      description: "Exchange will be accepted only if the customer provides a full, unedited unboxing video clearly showing the condition of the product at the time of opening."
    },
    {
      id: 5,
      icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
      title: "Valid Reasons Only",
      description: "The product will only be exchanged if it is damaged, defective, or incorrect at the time of delivery."
    },
    {
      id: 6,
      icon: <XCircle className="w-6 h-6 text-gray-600" />,
      title: "Exclusions Apply",
      description: "Certain items (e.g., personal hygiene products, sale items, or customized orders) are not eligible for exchange."
    },
    {
      id: 7,
      icon: <RefreshCw className="w-6 h-6 text-indigo-600" />,
      title: "Stock Availability",
      description: "Exchange is subject to availability of the replacement product in stock."
    },
    {
      id: 8,
      icon: <CreditCard className="w-6 h-6 text-teal-600" />,
      title: "Price Difference Policy",
      description: "If the exchanged product is of higher value, the price difference must be paid by the customer. If the value is lower, a store credit will be issued (no cash refund)."
    }
  ];

  return (
    <div className="min-h-screen mt-5 bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <ShoppingBag className="w-12 h-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">
                Same Day Exchange Policy
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              For Online Orders - Please review our exchange policy carefully before making a request
            </p>
          </div>
        </div>
      </div>

      {/* Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-6 md:gap-8">
          {policies.map((policy) => (
            <div 
              key={policy.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                    {policy.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                      {policy.id}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {policy.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {policy.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

    


      </div>
    </div>
  );
}
  