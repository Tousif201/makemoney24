import { motion, AnimatePresence } from "framer-motion";

function DetailsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center p-8 bg-white rounded-xl shadow-xl flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full"
        ></motion.div>
        <p className="text-xl font-semibold text-gray-700">
          Loading product details...
        </p>
        <p className="text-sm text-gray-500">Please wait a moment.</p>
      </motion.div>
    </div>
  );
}

export default DetailsLoading;
