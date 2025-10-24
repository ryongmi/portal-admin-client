'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Toast, { ToastType } from './Toast';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContainerProps {
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  maxToasts?: number;
}

let toastId = 0;
const subscribers: Array<(toasts: ToastData[]) => void> = [];
let toasts: ToastData[] = [];

const notify = (data: Omit<ToastData, 'id'>): string => {
  const newToast: ToastData = {
    ...data,
    id: `toast-${++toastId}`,
    message: data.message || '',
  };

  toasts = [newToast, ...toasts].slice(0, 10); // 최대 10개까지만 유지
  subscribers.forEach((fn) => fn([...toasts]));

  return newToast.id;
};

const removeToast = (id: string): void => {
  toasts = toasts.filter((toast) => toast.id !== id);
  subscribers.forEach((fn) => fn([...toasts]));
};

const clearAll = (): void => {
  toasts = [];
  subscribers.forEach((fn) => fn([]));
};

// 편의 함수들
const toast = {
  success: (title: string, message?: string, options?: Partial<ToastData>): string =>
    notify({ type: 'success', title, message: message || '', ...options }),

  error: (title: string, message?: string, options?: Partial<ToastData>): string =>
    notify({ type: 'error', title, message: message || '', duration: 8000, ...options }),

  warning: (title: string, message?: string, options?: Partial<ToastData>): string =>
    notify({ type: 'warning', title, message: message || '', duration: 6000, ...options }),

  info: (title: string, message?: string, options?: Partial<ToastData>): string =>
    notify({ type: 'info', title, message: message || '', ...options }),

  custom: (data: Omit<ToastData, 'id'>): string => notify(data),

  dismiss: removeToast,
  clear: clearAll,
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toastList, setToastList] = useState<ToastData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleToastsChange = (newToasts: ToastData[]): void => {
      setToastList(newToasts.slice(0, maxToasts));
    };

    subscribers.push(handleToastsChange);

    return (): void => {
      const index = subscribers.indexOf(handleToastsChange);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, [maxToasts]);

  const getPositionClasses = (): string => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  if (!mounted) return null;

  const content = (
    <div
      className={`fixed z-50 flex flex-col space-y-2 ${getPositionClasses()}`}
      aria-live="polite"
      aria-label="알림"
    >
      {toastList.map((toastData) => (
        <Toast key={toastData.id} {...toastData} onClose={removeToast} />
      ))}
    </div>
  );

  return createPortal(content, document.body);
};

export { toast };
export default ToastContainer;

