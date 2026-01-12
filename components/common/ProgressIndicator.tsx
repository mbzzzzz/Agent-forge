import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps,
  labels = []
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isUpcoming = step > currentStep;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center flex-1">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted || isCurrent 
                    ? 'var(--primary)' 
                    : 'var(--surface-variant)',
                  borderColor: isCurrent 
                    ? 'var(--primary)' 
                    : 'var(--outline)',
                }}
                className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 relative z-10
                  ${isCurrent ? 'ring-4 ring-primary/30' : ''}
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-on-primary" />
                ) : (
                  <span className={`text-sm font-semibold ${isCurrent ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                    {step}
                  </span>
                )}
              </motion.div>
              {labels[index] && (
                <span className={`text-xs mt-2 font-medium ${isCurrent || isCompleted ? 'text-on-surface' : 'text-on-surface-variant/60'}`}>
                  {labels[index]}
                </span>
              )}
            </div>
            {index < totalSteps - 1 && (
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted ? 'var(--primary)' : 'var(--outline)',
                }}
                className="h-0.5 flex-1 mx-2 transition-colors duration-300"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;



