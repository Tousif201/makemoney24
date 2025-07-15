import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { getAffiliateUserDetails } from "../../../../api/affiliate";
import { Sparkles, ShoppingBag, Users, PackageSearch } from "lucide-react";

const ShopNshipUserDetail = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAffiliateUserDetails(id);
        // console.log(res,"res from the sns detail")
        setUserData(res.data.affiliateUser); // Adjusted to match response structure
      } catch (err) {
        console.error("Error fetching user details", err);
      }
    })();
  }, [id]);

  if (!userData) return <div className="p-6">Loading...</div>;

  const {
    productBucket = [],
    totalProductSaled = 0,
    totalCommissionEarned = 0,
    userId = {},
  } = userData;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* User Info */}
      <div className="text-xl font-semibold">👤{userId.name} <h1 className="mt-2 font-normal text-xl">SponserCode</h1> ({userId.referredByCode})</div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products Sold</CardTitle>
            <ShoppingBag className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductSaled}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission Earned</CardTitle>
            <Sparkles className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCommissionEarned}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-500 to-pink-700 text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Code</CardTitle>
            <Users className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{userId.referralCode || "N/A"}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bucket Products</CardTitle>
            <PackageSearch className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productBucket.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products">
        <TabsList className="mb-4 bg-muted">
          <TabsTrigger value="products">🛍️ Products</TabsTrigger>
          <TabsTrigger value="orders">📦 Orders</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Bucket */}
          <TabsContent value="products">
            <Card>
              <CardHeader><CardTitle>Product Bucket</CardTitle></CardHeader>
              <CardContent>
                {productBucket.length === 0 ? (
                  <p className="text-gray-500 text-sm">No products in bucket.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productBucket.map((product, i) => (
                        <TableRow key={i}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category || "N/A"}</TableCell>
                          <TableCell>₹{product.price || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Placeholder */}
          <TabsContent value="orders">
            <Card>
              <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm">No orders data provided yet.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ShopNshipUserDetail;
