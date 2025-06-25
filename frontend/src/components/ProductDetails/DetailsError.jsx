
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";


function DetailsError() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center p-8 bg-white rounded-xl shadow-xl max-w-md w-full flex flex-col items-center gap-4"
        >
          <X className="h-16 w-16 text-red-500 animate-bounce" />
          <p className="text-2xl text-red-600 font-bold mb-2">
            Oops! An Error Occurred
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
            whileTap={{ scale: 0.95 }}
          >
            Reload Page
          </Button>
        </motion.div>
      </div>
    );
}

export default DetailsError