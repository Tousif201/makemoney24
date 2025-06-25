// src/components/ProductDetailPage/ProductTabs.jsx
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, UserCircle, PlayCircle } from "lucide-react"; // PlayCircle is already here
import LeaveReviewForm from "../LeaveReviewForm";

// Removed BentoGrid components imports
// import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
// Removed Icon import
// import { FileTextIcon } from "@radix-ui/react-icons";

const reviewItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function ProductTabs({
  product,
  productId,
  fetchProductDetails,
  averageRating,
  totalReviewsCount,
  openMediaViewer,
}) {
  const hasPortfolio = product.portfolio && product.portfolio.length > 0;

  return (
    <Card className="mb-12 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-6">
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:font-semibold rounded-md transition-all duration-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white"
            >
              Reviews ({totalReviewsCount})
            </TabsTrigger>

            <TabsTrigger
              value="description"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:font-semibold rounded-md transition-all duration-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white"
            >
              Description
            </TabsTrigger>

            {hasPortfolio && (
              <TabsTrigger
                value="portfolio"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:font-semibold rounded-md transition-all duration-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white"
              >
                Portfolio
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="prose max-w-none dark:prose-invert"
            >
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                {product.description}
              </p>
            </motion.div>
            {product.details && (
              <motion.div
                className="prose max-w-none dark:prose-invert mt-8"
                dangerouslySetInnerHTML={{ __html: product.details }}
              ></motion.div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Overall Review Summary */}
              <div className="flex items-center gap-8 bg-blue-50 dark:bg-blue-950 p-6 rounded-lg shadow-inner">
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-blue-700 dark:text-blue-200">
                    {averageRating}
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {totalReviewsCount} reviews
                  </div>
                </div>
                <div className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                  Customer satisfaction is key!
                </div>
              </div>
              <Separator className="bg-gray-200 dark:bg-gray-700" />

              {/* Individual Reviews List */}
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Customer Reviews
              </h3>
              <div className="space-y-8">
                {totalReviewsCount > 0 ? (
                  product.reviews
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    .map((review, index) => (
                      <motion.div
                        key={review._id}
                        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                        variants={reviewItemVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {review.userId?.avatar ? (
                            <img
                              src={review.userId.avatar}
                              alt={review.userId.name || "User"}
                              className="h-10 w-10 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
                            />
                          ) : (
                            <UserCircle className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-white text-lg">
                              {review.userId?.name || "Anonymous User"}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {" "}
                              •{" "}
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base mb-3">
                          {review.comment}
                        </p>
                        {review.media && review.media.length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-4">
                            {review.media.map((mediaItem, idx) => (
                              <motion.button
                                key={idx}
                                onClick={() =>
                                  openMediaViewer(mediaItem.url, mediaItem.type)
                                }
                                className="w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-lg cursor-pointer relative group border border-gray-200 dark:border-gray-700 shadow-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 10,
                                }}
                              >
                                {mediaItem.type === "image" ? (
                                  <img
                                    src={mediaItem.url}
                                    alt={`Review media ${idx + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                  />
                                ) : (
                                  <>
                                    <video
                                      src={mediaItem.url}
                                      className="w-full h-full object-cover"
                                      controls={false}
                                      muted
                                      loop
                                      playsInline
                                      preload="metadata"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors duration-200">
                                      <PlayCircle className="h-8 w-8 text-white" />
                                    </div>
                                  </>
                                )}
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-lg py-4 text-center">
                    No reviews yet for this product. Be the first to leave one!
                  </p>
                )}
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />
              {/* Leave a Review Section */}
              <LeaveReviewForm
                productId={productId}
                itemType={product.type}
                onReviewSubmitted={fetchProductDetails}
              />
            </motion.div>
          </TabsContent>

          {hasPortfolio && (
            <TabsContent value="portfolio" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Product Portfolio
                </h3>
                {/* Custom attractive media gallery */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {product.portfolio.map((item, index) => (
                    <motion.div
                      key={index}
                      onClick={() => openMediaViewer(item.url, item.type)}
                      className="relative w-full aspect-square overflow-hidden rounded-lg shadow-md border border-gray-200 dark:border-gray-700 group cursor-pointer
                      transform-gpu transition-all duration-300 hover:scale-[1.03] hover:shadow-xl" // Attractive hover effects
                      whileHover={{ scale: 1.05 }} // Additional Framer Motion for more control
                      whileTap={{ scale: 0.98 }}
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={`Portfolio item ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" // Image inside scales more
                        />
                      ) : (
                        <>
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            controls={false}
                            muted
                            loop
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors duration-200">
                            <PlayCircle className="h-12 w-12 text-white" /> {/* Larger play icon */}
                          </div>
                        </>
                      )}
                      {/* Optional: Overlay for title/description on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white text-sm font-semibold truncate">
                          {item.type === "image" ? `Image ${index + 1}` : `Video ${index + 1}`}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
