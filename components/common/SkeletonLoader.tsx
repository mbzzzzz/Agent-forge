import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'text' | 'image' | 'circle';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  variant = 'card',
  count = 1 
}) => {
  const baseClasses = "bg-gradient-to-r from-surface-variant/20 via-surface-variant/30 to-surface-variant/20 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]";
  
  const variants = {
    card: "rounded-xl h-48",
    text: "rounded-lg h-4",
    image: "rounded-lg aspect-square",
    circle: "rounded-full aspect-square"
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`${baseClasses} ${variants[variant]} ${className}`}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;



