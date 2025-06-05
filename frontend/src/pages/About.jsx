// import Image from "../assets/about.jpg";
import {
  ArrowRight,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import about from "../assets/about.jpg"
import about2 from "../assets/about2.jpg"
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function About() {
  return (
    <div className="min-h-screen bg-white  mx-0 lg:mx-40  ">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-800 to-pink-500 text-white py-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        {/* Left Content */}
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            About Shree Laabh Enterprises
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            A dynamic and diversified company integrating multiple independent
            brands and businesses under one unified platform, driving innovation
            and value across industries.
          </p>
          <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
            Contact Us <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2">
          <img
            src={about2}
            alt="About Shree Laabh Enterprises"
            className="rounded-2xl shadow-lg w-full h-auto max-h-[500px] object-cover"
          />
        </div>
      </div>
    </section>

      {/* Company Overview */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Story</h2>
            <p className="text-gray-600 mb-6 text-lg">
              Shree Laabh Enterprises is committed to innovation, quality, and
              customer satisfaction. We deliver practical and value-driven
              solutions across various industries, creating opportunities for
              growth and empowerment.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
                <span className="text-gray-700">
                  Trusted by thousands of customers nationwide
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
                <span className="text-gray-700">
                  Multiple business verticals under one umbrella
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
                <span className="text-gray-700">
                  Focus on quality, affordability and social impact
                </span>
              </div>
            </div>
          </div>
          <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-xl">
            <img
              src={about}
              alt="Shree Laabh Enterprises Team"
              className=" w-auto h-auto"
            />
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Our Vision & Mission
            </h2>
            <Separator className="mx-auto w-24 bg-purple-500 h-1 mb-6" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-purple-600 text-white">
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700">
                  To become a household name by offering high-quality,
                  affordable, and meaningful products while creating a positive
                  impact on society.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-pink-600 text-white">
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Promote self-reliance through entrepreneurship and
                      affiliate opportunities
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Provide quality products that enhance everyday life
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span>Create employment and empower women and youth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Build trust through consistency, transparency, and value
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">What We Do</h2>
          <Separator className="mx-auto w-24 bg-purple-500 h-1 mb-6" />
          <p className="text-gray-600 text-lg">
            Our diverse portfolio of businesses serves various customer needs
            across multiple industries.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>MakeMoney24</CardTitle>
              <CardDescription>E-commerce Platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                A trusted online shopping platform offering a wide range of
                products, easy navigation, and secure transactions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle>VIP Queen's Sanity Napkin</CardTitle>
              <CardDescription>Women's Health Products</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                A women-centric brand providing premium-quality sanitary napkins
                that are safe, comfortable, and affordable.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-amber-600"
                >
                  <path d="M19 7v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7"></path>
                  <path d="M12 2v5"></path>
                  <path d="M5 8h14"></path>
                  <path d="m15 13-3 3-3-3"></path>
                </svg>
              </div>
              <CardTitle>Pooja Samagri Manufacturing</CardTitle>
              <CardDescription>Traditional Religious Items</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Manufacturing and distributing pure and traditional pooja items
                such as incense sticks, camphor, ghee diyas, and more.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>ShopnShip</CardTitle>
              <CardDescription>Warehousing & Logistics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Reliable warehousing and logistics services to support efficient
                inventory management and fast deliveries.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-green-600"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <path d="M12 17h.01"></path>
                </svg>
              </div>
              <CardTitle>OnlineMultiply</CardTitle>
              <CardDescription>Digital Marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                A digital marketplace connecting consumers with various
                essential products and services through a simple and accessible
                online platform.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-orange-600"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <CardTitle>Affiliate Marketing Program</CardTitle>
              <CardDescription>Income Opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Empowering individuals, influencers, and digital marketers to
                earn income by promoting our products and services through a
                structured affiliate network.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-purple-200">Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5+</div>
              <div className="text-purple-200">Business Verticals</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-purple-200">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-purple-200">Affiliates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Get in Touch
          </h2>
          <Separator className="mx-auto w-24 bg-purple-500 h-1 mb-6" />
          <p className="text-gray-600 text-lg">
            Interested in our products or partnership opportunities, including
            affiliate collaboration? Reach out today and grow with Shree Laabh
            Enterprises.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">
              Contact Information
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Address</h4>
                  <p className="text-gray-600">
                    123 Business Park, Main Street, City, State, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Email</h4>
                  <p className="text-gray-600">contact@shreelaabh.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Phone</h4>
                  <p className="text-gray-600">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your Name"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="subject"
                  className="text-sm font-medium text-gray-700"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="How can we help?"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your message here..."
                ></textarea>
              </div>

              <Button
                size="lg"
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Join Our Affiliate Program
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Become a part of our growing network and earn income by promoting
            our quality products.
          </p>
          <Button
            size="lg"
            className="bg-white text-purple-700 hover:bg-gray-100"
          >
            Apply Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
