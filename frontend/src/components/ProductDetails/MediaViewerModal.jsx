// src/components/ProductDetailPage/MediaViewerModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export default function MediaViewerModal({ isOpen, currentMedia, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
          onClick={onClose}
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="relative bg-gray-900 p-2 rounded-xl shadow-2xl max-w-5xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/20 text-white hover:bg-white/40 hover:text-white rounded-full p-2 transition-all duration-200"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-6 w-6" />
            </Button>
            {currentMedia.type === "image" ? (
              <img
                src={currentMedia.url}
                alt="Enlarged media"
                className="max-w-full max-h-[85vh] object-contain mx-auto my-auto rounded-lg"
              />
            ) : (
              <video
                src={currentMedia.url}
                controls
                autoPlay
                loop
                className="max-w-full max-h-[85vh] object-contain mx-auto my-auto rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}