'use client';

import { useEffect, useRef } from 'react';

export const useFocusManagement = (isOpen: boolean): { containerRef: React.RefObject<HTMLDivElement> } => {
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Save the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the container or first focusable element
      if (containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        } else {
          containerRef.current.focus();
        }
      }
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Tab' && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return (): void => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  return { containerRef };
};

export const useSkipLink = (): { skipLinkRef: React.RefObject<HTMLAnchorElement>; handleSkipToContent: (event: React.KeyboardEvent) => void } => {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  const handleSkipToContent = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const mainContent = document.querySelector('main, #main-content, [role="main"]');
      if (mainContent) {
        (mainContent as HTMLElement).focus();
      }
    }
  };

  return { skipLinkRef, handleSkipToContent };
};
