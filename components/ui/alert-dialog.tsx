"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from "react";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;

export function AlertDialogOverlay({ className = "", ...props }: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay> & { className?: string }) {
  return <AlertDialogPrimitive.Overlay className={`shadcn-alert-dialog-overlay ${className}`} {...props} />;
}

export function AlertDialogContent({ className = "", children, ...props }: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & { className?: string; children?: ReactNode }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content className={`shadcn-alert-dialog-content ${className}`} {...props}>
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  );
}

export function AlertDialogHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement> & { className?: string }) {
  return <div className={`shadcn-alert-dialog-header ${className}`} {...props} />;
}

export function AlertDialogTitle({ className = "", ...props }: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title> & { className?: string }) {
  return <AlertDialogPrimitive.Title className={`shadcn-alert-dialog-title ${className}`} {...props} />;
}

export function AlertDialogDescription({ className = "", ...props }: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description> & { className?: string }) {
  return <AlertDialogPrimitive.Description className={`shadcn-alert-dialog-description ${className}`} {...props} />;
}

export function AlertDialogFooter({ className = "", ...props }: HTMLAttributes<HTMLDivElement> & { className?: string }) {
  return <div className={`shadcn-alert-dialog-footer ${className}`} {...props} />;
}

export function AlertDialogCancel({ className = "", ...props }: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel> & { className?: string }) {
  return <AlertDialogPrimitive.Cancel type="button" className={`shadcn-alert-dialog-cancel ${className}`} {...props} />;
}

export function AlertDialogAction({ className = "", ...props }: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> & { className?: string }) {
  return <AlertDialogPrimitive.Action type="button" className={`shadcn-alert-dialog-action ${className}`} {...props} />;
}
