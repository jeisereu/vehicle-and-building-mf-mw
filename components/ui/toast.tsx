"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export function ToastProvider({ children }: { children: ReactNode }) {
  return <ToastPrimitive.Provider swipeDirection="right">{children}</ToastPrimitive.Provider>;
}

export function Toast({ className = "", ...props }: ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & { className?: string }) {
  return <ToastPrimitive.Root className={`app-toast ${className}`} {...props} />;
}

export function ToastTitle({ className = "", ...props }: ComponentPropsWithoutRef<typeof ToastPrimitive.Title> & { className?: string }) {
  return <ToastPrimitive.Title className={`toast-title ${className}`} {...props} />;
}

export function ToastDescription({ className = "", ...props }: ComponentPropsWithoutRef<typeof ToastPrimitive.Description> & { className?: string }) {
  return <ToastPrimitive.Description className={`toast-description ${className}`} {...props} />;
}

export function ToastClose() {
  return (
    <ToastPrimitive.Close className="toast-close" aria-label="Close notification">
      <X size={16} aria-hidden="true" />
    </ToastPrimitive.Close>
  );
}

export function ToastViewport() {
  return <ToastPrimitive.Viewport className="toast-viewport" />;
}
