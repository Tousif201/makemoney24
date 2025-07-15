import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useSession } from "../../context/SessionContext";
import { toast } from "sonner";
import { addAffiliateUserBucket } from "../../../api/affiliate";
export default function ProductInfo({
  product,
  averageRating,
  totalReviewsCount,
}) {
  const { user } = useSession();
  // console.log(user, "sesion context user");
  return (
    <motion.div>
      <div className="flex items-center gap-3 mb-2">
        <Badge
          variant="outline"
          className="text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700"
        >
          {product.categoryId?.name || "Uncategorized"}
        </Badge>
        <Badge
          variant="secondary"
          className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
        </Badge>
      </div>

      {/* Title and Add to Bucket button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <h1 className="text-xl lg:text-2xl font-extrabold leading-tight text-gray-900 dark:text-white">
          {product.title}
        </h1>

        {user?.roles?.includes("affiliate") && (
          <button
            className="bg-orange-400 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-md shadow-sm transition cursor-pointer"
            onClick={async () => {
              try {
                const res = await addAffiliateUserBucket(product._id);
                toast.success(res.message || "Product added to bucket!");
              } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || "Failed to add to bucket");
              }
            }}
          >
            ➕Add to your Bucket
          </button>
        )}


      </div>

      {/* Rating section */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 md:h-6 md:w-6 ${i < Math.floor(averageRating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
                }`}
            />
          ))}
          <span className="ml-2 text-xs md:text-base font-semibold text-gray-700 dark:text-gray-300">
            {averageRating} ({totalReviewsCount} reviews)
          </span>
        </div>
      </div>

      {/* Price display */}
      <div className="flex flex-wrap items-baseline gap-4">
        {/* Final Price */}
        <span className="md:text-2xl text-lg font-bold text-gray-900 dark:text-white">
          ₹
          {(
            product.price *
            (1 - (product.discountRate || 0) / 100)
          ).toLocaleString()}
        </span>
        {/* Discount */}
        {product.discountRate > 0 && product.discountRate <= 100 && (
          <>
            <span className="md:text-xl text-base text-gray-500 line-through">
              ₹{product.price.toLocaleString()}
            </span>
            <Badge className="bg-green-100 text-green-800 text-xs md:text-base dark:bg-green-900 dark:text-green-200 font-semibold px-3 py-1 rounded-full">
              Save {product.discountRate}%
            </Badge>
          </>
        )}
        {/* Courier Charge Badge */}
        <Badge
          className={`${product.courierCharges > 0
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            } text-xs md:text-base font-semibold px-3 py-1 rounded-full`}
        >
          {product.courierCharges > 0
            ? `Delivery ₹${product.courierCharges.toLocaleString()}`
            : "Free Delivery"}
        </Badge>
      </div>

      {/* Conditionally render exchange and return policy */}
      {product.type === "product" && (
        <div className="mt-4">
          {/* <p className="text-sm text-gray-600 dark:text-gray-300">
            Exchange and Return Policy: Our exchange and return policy allow you to return or exchange this product within 30 days of purchase, provided it is in its original condition.
          </p> */}
        </div>
      )}
    </motion.div>
  );
}
