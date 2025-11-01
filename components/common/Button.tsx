
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ isLoading = false, variant = 'primary', children, className = '', ...props }) => {
  const baseClasses = "flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background shadow-lg hover:shadow-xl min-h-[44px]"; // min-h for touch targets
  const variantClasses = {
    primary: 'bg-primary text-on-primary hover:bg-primary/90 focus:ring-primary hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-surface-variant/80 backdrop-blur-sm text-on-surface-variant border border-outline/30 hover:bg-surface-variant focus:ring-secondary hover:scale-[1.02] active:scale-[0.98]',
  };
  const disabledClasses = "disabled:bg-surface-variant/50 disabled:cursor-not-allowed disabled:text-on-surface-variant/50 disabled:shadow-none disabled:hover:scale-100 disabled:opacity-60";

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={isLoading ? {} : { scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      disabled={isLoading || props.disabled}
      aria-busy={isLoading}
      aria-disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-3 h-5 w-5" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span className={isLoading ? 'opacity-70' : ''}>{children}</span>
    </motion.button>
  );
};

export default Button;