
import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  text?: string;
}

const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const loadingCircleVariants = {
  start: {
    y: "0%",
  },
  end: {
    y: "100%",
  },
};

const loadingCircleTransition = {
  duration: 0.4,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: "easeInOut",
};


const Loader: React.FC<LoaderProps> = ({ text = "Generating..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 rounded-xl relative">
      {/* Glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 rounded-xl blur-xl animate-pulse"></div>
      
      <motion.div
        className="flex justify-around items-center w-20 h-8 relative z-10"
        variants={loadingContainerVariants}
        initial="start"
        animate="end"
      >
        <motion.span
          className="block w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/50"
          variants={loadingCircleVariants}
          transition={loadingCircleTransition}
        />
        <motion.span
          className="block w-5 h-5 rounded-full bg-gradient-to-br from-secondary to-primary shadow-lg shadow-secondary/50"
          variants={loadingCircleVariants}
          transition={{ ...loadingCircleTransition, delay: 0.1 }}
        />
        <motion.span
          className="block w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/50"
          variants={loadingCircleVariants}
          transition={{ ...loadingCircleTransition, delay: 0.2 }}
        />
      </motion.div>
      
      {text && (
        <motion.p 
          className="text-lg font-semibold text-on-surface-variant relative z-10 bg-gradient-to-r from-on-surface-variant to-on-surface bg-clip-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default Loader;