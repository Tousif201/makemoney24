import {
  Calculator,
  CreditCard,
  FileText,
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  Link,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import image from "../assets/emi.png"

export default function EMIDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] bg-contain rounded-2xl bg-center bg-no-repeat mx-2 mt-5"
        style={{ backgroundImage: `url(${image})` }}>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-cover bg-opacity-30"></div>

        {/* Content container */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {/* <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-8 sm:py-12 md:py-16 lg:py-20 text-center text-white">

          </div> */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* What is EMI Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Info className="h-6 w-6 text-blue-600" />
              What is Plan?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-blue-100 to-white p-6 rounded-xl shadow-sm border border-blue-200">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Shop Smart with makemoney24hrs.com</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Join <span className="font-semibold text-blue-800">makemoney24hrs.com</span> and enjoy the power of
                <strong className="text-blue-900"> EMI (Equated Monthly Installments)</strong> on a wide selection of products!
                As a premium member, you can shop now and split your payments over time — simple, secure, and smart.
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
              <h4 className="font-semibold text-xl text-blue-900 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Exclusive EMI Benefits:
              </h4>
              <ul className="list-disc list-inside space-y-2 text-blue-800 text-base pl-2">
                <li>Flexible & fixed monthly payments</li>
                <li>Instant access to top trending products</li>
                <li>Zero hidden charges for members</li>
                <li>Ideal for planned and stress-free shopping</li>
                <li>Join now and start shopping on EMI today!</li>
              </ul>
            </div>

            {/* <div className="text-center">
              <Button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-full shadow-md transition duration-300">
                Become a Member & Start EMI Shopping
              </Button>
            </div> */}
          </CardContent>

        </Card>

        {/* EMI Calculation Methods */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calculator className="h-6 w-6 text-green-600" />
              EMI Calculation Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Standard EMI Formula</h3>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-center">
                EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p>
                  <strong>P</strong> = Principal loan amount
                </p>
                <p>
                  <strong>R</strong> = Monthly interest rate (Annual rate ÷ 12)
                </p>
                <p>
                  <strong>N</strong> = Number of monthly installments
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3">Example Calculation</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Loan Details</h4>
                  <ul className="space-y-1 text-green-800">
                    <li>Principal: ₹5,00,000</li>
                    <li>Interest Rate: 10% per annum</li>
                    <li>Tenure: 5 years (60 months)</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Calculation</h4>
                  <ul className="space-y-1 text-blue-800">
                    <li>Monthly Rate: 10%/12 = 0.833%</li>
                    <li>EMI: ₹10,624</li>
                    <li>Total Payment: ₹6,37,440</li>
                    <li>Total Interest: ₹1,37,440</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Types of EMI */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CreditCard className="h-6 w-6 text-purple-600" />
              Types of EMI Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Fixed EMI</h3>
                <p className="text-sm text-gray-600 mb-3">Same amount throughout the loan tenure</p>
                <Badge variant="secondary">Most Common</Badge>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Step-up EMI</h3>
                <p className="text-sm text-gray-600 mb-3">EMI increases periodically</p>
                <Badge variant="outline">For Growing Income</Badge>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Step-down EMI</h3>
                <p className="text-sm text-gray-600 mb-3">EMI decreases over time</p>
                <Badge variant="outline">For Reducing Income</Badge>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Flexible EMI</h3>
                <p className="text-sm text-gray-600 mb-3">Pay different amounts based on cash flow</p>
                <Badge variant="outline">Variable Payment</Badge>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Balloon EMI</h3>
                <p className="text-sm text-gray-600 mb-3">Lower EMIs with large final payment</p>
                <Badge variant="outline">Lower Monthly</Badge>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Skip EMI</h3>
                <p className="text-sm text-gray-600 mb-3">Option to skip certain months</p>
                <Badge variant="outline">Seasonal Income</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Apply for EMI */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-6 w-6 text-orange-600" />
              How to Apply for EMI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Step-by-Step Process</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Research & Compare</h4>
                      <p className="text-sm text-gray-600">
                        Compare interest rates, terms, and conditions from different lenders
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Check Eligibility</h4>
                      <p className="text-sm text-gray-600">Verify your eligibility criteria and credit score</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Gather Documents</h4>
                      <p className="text-sm text-gray-600">Collect all required documents and certificates</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">Submit Application</h4>
                      <p className="text-sm text-gray-600">Fill out the application form and submit with documents</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                      5
                    </div>
                    <div>
                      <h4 className="font-medium">Verification & Approval</h4>
                      <p className="text-sm text-gray-600">Wait for document verification and loan approval</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                      6
                    </div>
                    <div>
                      <h4 className="font-medium">Loan Disbursement</h4>
                      <p className="text-sm text-gray-600">Receive loan amount and start EMI payments</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Identity Proof</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Aadhaar Card</li>
                      <li>• PAN Card</li>
                      <li>• Passport</li>
                      <li>• Voter ID</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Address Proof</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Utility Bills</li>
                      <li>• Bank Statements</li>
                      <li>• Rental Agreement</li>
                      <li>• Property Documents</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Income Proof</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Salary Slips (3 months)</li>
                      <li>• Bank Statements (6 months)</li>
                      <li>• ITR (2 years)</li>
                      <li>• Employment Certificate</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility Criteria */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6 text-indigo-600" />
              Eligibility Criteria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Criteria</TableHead>
                  <TableHead>Salaried</TableHead>
                  <TableHead>Self-Employed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Age</TableCell>
                  <TableCell>21-65 years</TableCell>
                  <TableCell>25-70 years</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Minimum Income</TableCell>
                  <TableCell>₹25,000 per month</TableCell>
                  <TableCell>₹3,00,000 per annum</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Work Experience</TableCell>
                  <TableCell>2+ years</TableCell>
                  <TableCell>3+ years in business</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Credit Score</TableCell>
                  <TableCell>750+</TableCell>
                  <TableCell>750+</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Employment</TableCell>
                  <TableCell>Stable job</TableCell>
                  <TableCell>Profitable business</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Benefits and Considerations */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-green-700">
                <CheckCircle className="h-5 w-5" />
                Benefits of EMI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Fixed monthly payments for better budgeting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Access to expensive items immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Build credit history with timely payments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Tax benefits on certain loan types</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Preserve cash flow for other investments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Flexible tenure options</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-red-700">
                <AlertCircle className="h-5 w-5" />
                Important Considerations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Interest cost increases total purchase price</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Missed payments can affect credit score</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Prepayment penalties may apply</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Processing fees and charges</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Fixed commitment regardless of income changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Asset depreciation vs. loan balance</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Tips for Better EMI Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TrendingUp className="h-6 w-6 text-teal-600" />
              Tips for Better EMI Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-semibold text-teal-900 mb-2">Choose Right Tenure</h4>
                <p className="text-sm text-teal-800">Balance between EMI amount and total interest cost</p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-semibold text-teal-900 mb-2">Maintain Good Credit</h4>
                <p className="text-sm text-teal-800">Keep credit score above 750 for better rates</p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-semibold text-teal-900 mb-2">Set Up Auto-Pay</h4>
                <p className="text-sm text-teal-800">Avoid missed payments with automatic deductions</p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-semibold text-teal-900 mb-2">Make Prepayments</h4>
                <p className="text-sm text-teal-800">Reduce interest burden with partial prepayments</p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-semibold text-teal-900 mb-2">Compare Rates</h4>
                <p className="text-sm text-teal-800">Shop around for the best interest rates</p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-semibold text-teal-900 mb-2">Read Fine Print</h4>
                <p className="text-sm text-teal-800">Understand all terms, fees, and conditions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Alerts */}
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Security Reminder</AlertTitle>
            <AlertDescription>
              Never share your personal or financial information with unauthorized parties. Always verify the lender's
              credentials before applying.
            </AlertDescription>
          </Alert>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Professional Advice</AlertTitle>
            <AlertDescription>
              Consider consulting with a financial advisor to determine the best EMI option for your specific financial
              situation and goals.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
