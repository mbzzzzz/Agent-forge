import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
          >
            <div className="bg-surface-variant/95 backdrop-blur-sm border border-outline/40 rounded-lg px-3 py-2 text-xs text-on-surface-variant shadow-xl max-w-xs">
              {content}
              <div className={`absolute w-2 h-2 bg-surface-variant/95 border border-outline/40 ${
                position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1 rotate-45 border-t-0 border-l-0' :
                position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1 rotate-45 border-b-0 border-r-0' :
                position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1 rotate-45 border-l-0 border-b-0' :
                'right-full top-1/2 -translate-y-1/2 -mr-1 rotate-45 border-r-0 border-t-0'
              }`}></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const TooltipIcon: React.FC<{ content: string; className?: string }> = ({ content, className = '' }) => {
  return (
    <Tooltip content={content}>
      <Info className={`w-4 h-4 text-on-surface-variant/60 hover:text-on-surface-variant cursor-help ${className}`} />
    </Tooltip>
  );
};

export default Tooltip;

