
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, helperText, error, required, id, maxLength, showCharCount, ...props }, ref) => {
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
          className={`w-full bg-surface-variant/30 border rounded-lg px-4 py-3 text-white placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-surface-variant/50 transition-all duration-200 backdrop-blur-sm ${
            hasError 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' 
              : 'border-outline/40 hover:border-outline/60'
          } ${maxLength && currentLength >= maxLength * 0.9 ? 'border-yellow-500/50' : ''} ${className}`}
          {...props}
        />
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