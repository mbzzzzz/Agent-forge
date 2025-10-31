
import React from 'react';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-surface-variant/40 border border-outline/50 rounded-md px-4 py-3 text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
export default Input;