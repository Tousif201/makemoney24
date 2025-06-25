import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

import { ShoppingCart } from "lucide-react";

function NoProduct() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center p-8 bg-white rounded-xl shadow-xl max-w-md w-full flex flex-col items-center gap-4"
      >
        <ShoppingCart className="h-16 w-16 text-gray-400 mb-2" />
        <p className="text-2xl text-gray-700 font-bold mb-2">
          Product Not Found
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          The product or service you are looking for does not exist or has been
          removed.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
            whileTap={{ scale: 0.95 }}
          >
            Go Back
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200"
            whileTap={{ scale: 0.95 }}
          >
            Go to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default NoProduct;
