'use client';

import React from 'react';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface LoadingButtonProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText = '처리 중...',
  children,
  disabled,
  onClick,
  ...buttonProps
}) => {
  const handleClick = (): void => {
    if (!isLoading && onClick) {
      onClick();
    }
  };

  return (
    <Button
      {...buttonProps}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`relative no-underline ${buttonProps.className || ''}`}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      aria-live="polite"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" className="mr-2" />
          <span>{loadingText}</span>
        </div>
      )}
      <div className={`flex items-center justify-center ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
    </Button>
  );
};

export default LoadingButton;