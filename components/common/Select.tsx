
import React from 'react';

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={`w-full bg-surface-variant/30 backdrop-blur-sm border border-outline/40 rounded-lg px-4 py-3 text-white placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-surface-variant/50 transition-all duration-200 appearance-none hover:border-outline/60 cursor-pointer ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant/70">
            <svg className="h-5 w-5 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';
export default Select;