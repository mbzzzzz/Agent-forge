
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, helperText, error, required, id, maxLength, showCharCount, leftIcon, rightIcon, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const currentLength = typeof props.value === 'string' ? props.value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-on-surface-variant mb-2"
          >
            {label}
            {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
          </label>
        )}
        <div className="relative group/input">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-on-surface-variant/70 group-focus-within/input:text-primary transition-colors duration-200 pointer-events-none flex items-center justify-center">
              <div className="w-5 h-5 flex items-center justify-center">
                {leftIcon}
              </div>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-label={label || props['aria-label']}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            aria-invalid={hasError}
            aria-required={required}
            maxLength={maxLength}
            className={`w-full bg-surface-variant/20 border rounded-xl py-3.5 text-white placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 focus:bg-surface-variant/40 transition-all duration-300 backdrop-blur-md ${hasError
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
                : 'border-outline/30 hover:border-outline/50'
              } ${maxLength && currentLength >= maxLength * 0.9 ? 'border-yellow-500/50' : ''} ${leftIcon ? 'pl-[3.75rem]' : 'pl-4'
              } ${rightIcon ? 'pr-[3.75rem]' : 'pr-4'} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-on-surface-variant/70 group-focus-within/input:text-primary transition-colors duration-200 pointer-events-none flex items-center justify-center">
              <div className="w-5 h-5 flex items-center justify-center">
                {rightIcon}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-1">
          {helperText && !error && (
            <p id={`${inputId}-helper`} className="text-xs text-on-surface-variant/70">
              {helperText}
            </p>
          )}
          {error && (
            <p id={`${inputId}-error`} className="text-xs text-red-400" role="alert">
              {error}
            </p>
          )}
          {showCharCount && maxLength && (
            <p className={`text-xs ml-auto ${currentLength >= maxLength ? 'text-red-400' : currentLength >= maxLength * 0.9 ? 'text-yellow-400' : 'text-on-surface-variant/70'}`}>
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;