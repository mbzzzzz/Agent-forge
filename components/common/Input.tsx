
import React from 'react';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-surface-variant/30 border border-outline/40 rounded-lg px-4 py-3 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-surface-variant/50 transition-all duration-200 backdrop-blur-sm hover:border-outline/60 ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
export default Input;