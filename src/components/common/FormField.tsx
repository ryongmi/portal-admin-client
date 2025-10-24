'use client';

import React from 'react';
import { FieldError } from 'react-hook-form';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: FieldError | string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
  id?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  children,
  className = '',
  hint,
  id,
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className={`space-y-1 ${className}`}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="필수 입력">*</span>}
      </label>
      
      {hint && (
        <p 
          id={hintId}
          className="text-xs text-gray-500 dark:text-gray-400"
        >
          {hint}
        </p>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-required': required,
          'aria-invalid': !!errorMessage,
          'aria-describedby': `${hint ? hintId : ''} ${errorMessage ? errorId : ''}`.trim() || undefined,
        })}
        {errorMessage && (
          <div className="absolute -bottom-5 left-0">
            <p 
              id={errorId}
              className="text-xs text-red-600 dark:text-red-400 flex items-center"
              role="alert"
              aria-live="polite"
            >
              <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errorMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError | string;
}

export const Input: React.FC<InputProps> = ({ error, className = '', ...props }) => {
  const hasError = Boolean(error);
  
  return (
    <input
      className={`
        w-full px-3 py-2 border rounded-md transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${hasError 
          ? 'border-red-300 focus:ring-red-500' 
          : 'border-gray-300 hover:border-gray-400'
        }
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400
        ${className}
      `}
      aria-invalid={hasError}
      {...props}
    />
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: FieldError | string;
}

export const Textarea: React.FC<TextareaProps> = ({ error, className = '', ...props }) => {
  const hasError = Boolean(error);
  
  return (
    <textarea
      className={`
        w-full px-3 py-2 border rounded-md transition-colors resize-vertical
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${hasError 
          ? 'border-red-300 focus:ring-red-500' 
          : 'border-gray-300 hover:border-gray-400'
        }
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400
        ${className}
      `}
      aria-invalid={hasError}
      {...props}
    />
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: FieldError | string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  error, 
  options, 
  placeholder, 
  className = '', 
  ...props 
}) => {
  const hasError = Boolean(error);
  
  return (
    <select
      className={`
        w-full px-3 py-2 border rounded-md transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${hasError 
          ? 'border-red-300 focus:ring-red-500' 
          : 'border-gray-300 hover:border-gray-400'
        }
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
        ${className}
      `}
      aria-invalid={hasError}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option 
          key={option.value} 
          value={option.value} 
          disabled={option.disabled}
          aria-label={option.disabled ? `${option.label} (비활성화됨)` : undefined}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError | string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  error, 
  className = '', 
  id,
  ...props 
}) => {
  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${checkboxId}-error`;
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center">
        <input
          id={checkboxId}
          type="checkbox"
          className={`
            h-4 w-4 rounded border-gray-300 text-blue-600 
            focus:ring-blue-500 focus:ring-2 transition-colors
            ${hasError ? 'border-red-300' : ''}
          `}
          aria-invalid={hasError}
          aria-describedby={errorMessage ? errorId : undefined}
          {...props}
        />
        <label 
          htmlFor={checkboxId}
          className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          {label}
        </label>
      </div>
      {errorMessage && (
        <p 
          id={errorId}
          className="text-xs text-red-600 dark:text-red-400 flex items-center"
          role="alert"
          aria-live="polite"
        >
          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormField;