"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentPropsWithoutRef } from "react";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({ className = "", sideOffset = 8, ...props }: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & { className?: string }) {
  return <PopoverPrimitive.Portal><PopoverPrimitive.Content className={`shadcn-popover ${className}`} sideOffset={sideOffset} {...props} /></PopoverPrimitive.Portal>;
}
