
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost'; // Added ghost
  size?: 'sm' | 'md' | 'lg'; // Added size
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ isLoading = false, variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const baseClasses = "flex items-center justify-center gap-2 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:bg-surface-variant/50 disabled:cursor-not-allowed disabled:text-on-surface-variant/50 disabled:shadow-none disabled:hover:scale-100 disabled:opacity-60";

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs min-h-[32px]',
    md: 'px-6 py-3 min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  };

  const variantClasses = {
    primary: 'bg-primary text-on-primary hover:bg-primary/90 focus:ring-primary shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-surface-variant/80 backdrop-blur-sm text-on-surface-variant border border-outline/30 hover:bg-surface-variant focus:ring-secondary shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
    ghost: 'bg-transparent text-on-surface-variant hover:bg-white/5 hover:text-on-surface focus:ring-primary/50 shadow-none hover:shadow-none' // Added ghost style
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={isLoading ? {} : { scale: variant === 'ghost' ? 1 : 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
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