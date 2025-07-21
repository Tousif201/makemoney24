import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function TermsAndConditions() {
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

        {/* Static T&C Content */}
        <div className="space-y-6 text-gray-800 text-sm leading-relaxed">
          <Card className="shadow-sm">
            <CardHeader className="text-2xl text-blue-500">
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Makemoney24 (Shree Labh Enterprises) is owned and operated by Make Money 24 (Shree Labh Enterprises) (“we” or “us”), a company incorporated under the laws of India.
              </p>
              <p>
                Please note that this is a business/commercial site and can be accessed only by a valid account holder. Your access and use of the Site is subject to the following terms and conditions (“Website Terms and Conditions”) and all applicable laws. By accessing and browsing this Site, you accept, without limitation or qualification, the Website Terms and Conditions. If you do not agree with any of the below Terms and Conditions, do not use this Site.
              </p>
              <p>
                We reserve the right, in our sole discretion, to modify, alter or otherwise update these Website Terms and Conditions at any time and you agree to be bound by such modifications, alterations or updates.
              </p>

              <h3 className="font-semibold mt-6">Intended Audience</h3>
              <p>
                Unless otherwise specified, this site is intended for two categories of people:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Make Money 24 (Shree Labh Enterprises)</li>
                <li>Customers</li>
              </ul>
              <p>
                Each category in turn is bound by an additional agreement. Make Money 24 is bound by the “Make Money 24 (Shree Labh Enterprises) Agreement”; and a customer is bound by the “Customer Agreement”. These agreements are referenced on the relevant sections of the website. It is your responsibility to review and comply with the appropriate agreement.
              </p>
              <p>
                This website is operated by us from India and intended for users within India. If you access this website from outside India, you do so at your own risk and must comply with your local laws.
              </p>

              <h3 className="font-semibold mt-6">No Cosmetics or Healthcare Advice</h3>
              <p>
                The products, information, services and other content provided on this site (including Linked Sites) are intended for informational purposes only and to facilitate discussions with your beauticians or healthcare professionals (“Cosmetics Professional”).
              </p>
              <p>
                This content is not a substitute for professional advice or any instructions on a product label or packaging. We do not offer any healthcare advice, recommendations, or opinions.
              </p>

              <h3 className="font-semibold mt-6">Refund Policy</h3>
              <p>
                We offer a full money-back guarantee within 30 days of the invoice date for all products. If you're not satisfied, return the product to us and you will qualify for a full refund, minus shipping.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Refunds are issued only after returned products are received.</li>
                <li>Customer bears the shipping cost unless the product was damaged during delivery.</li>
                <li>Damaged products will be reshipped free of charge by the company.</li>
                <li>Refunds are processed to the original payment method (e.g. credit card).</li>
                <li>No exchange or cancellation policy once the product is shipped.</li>
                <li>If the product is canceled before shipping, no charges will apply.</li>
              </ul>

              <h3 className="font-semibold mt-6">Intellectual Property Rights</h3>
              <p>
                All rights, title, and interest in the content and design of this site are owned by Make Money 24. Users are prohibited from reproducing, distributing, or displaying any content without explicit written permission.
              </p>
            </CardContent>
          </Card>
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
