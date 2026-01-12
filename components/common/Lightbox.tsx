import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2 } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
  type?: 'image' | 'video';
}

const Lightbox: React.FC<LightboxProps> = ({ isOpen, onClose, src, alt = '', type = 'image' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-7xl max-h-[90vh] w-full"
        >
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-white hover:text-primary transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          {type === 'image' ? (
            <img
              src={src}
              alt={alt}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          ) : (
            <video
              src={src}
              controls
              autoPlay
              className="w-full h-auto max-h-[90vh] rounded-lg shadow-2xl"
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Lightbox;

