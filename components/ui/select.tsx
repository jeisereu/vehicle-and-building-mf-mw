"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className = "", children, ...props }: ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { className?: string; children?: ReactNode }) {
  return <SelectPrimitive.Trigger className={`shadcn-select-trigger ${className}`} {...props}>{children}<SelectPrimitive.Icon><ChevronDown size={14} aria-hidden="true" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>;
}

export function SelectContent({ className = "", children, ...props }: ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & { className?: string; children?: ReactNode }) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content className={`shadcn-select-content ${className}`} position="popper" {...props}><SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal>;
}

export function SelectItem({ className = "", children, ...props }: ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { className?: string; children?: ReactNode }) {
  return <SelectPrimitive.Item className={`shadcn-select-item ${className}`} {...props}><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator><Check size={14} aria-hidden="true" /></SelectPrimitive.ItemIndicator></SelectPrimitive.Item>;
}
