
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
    <div className="flex flex-col items-center justify-center gap-6 p-8 rounded-lg">
       <motion.div
         className="flex justify-around items-center w-16 h-8"
         variants={loadingContainerVariants}
         initial="start"
         animate="end"
       >
         <motion.span
            className="block w-4 h-4 bg-primary rounded-full shadow-glow"
            variants={loadingCircleVariants}
            transition={loadingCircleTransition}
         />
         <motion.span
            className="block w-4 h-4 bg-primary rounded-full shadow-glow"
            variants={loadingCircleVariants}
            transition={loadingCircleTransition}
         />
         <motion.span
            className="block w-4 h-4 bg-primary rounded-full shadow-glow"
            variants={loadingCircleVariants}
            transition={loadingCircleTransition}
         />
       </motion.div>
      <p className="text-lg font-semibold text-on-surface-variant">{text}</p>
    </div>
  );
};

export default Loader;