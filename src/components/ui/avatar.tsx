"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

function Avatar({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "group relative flex size-8 shrink-0 overflow-hidden rounded-full outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:ring-0",
        className
      )}
      {...props}
    >
      {children}

      {/* Hover efekti (Clerk-style sheen) */}
      <span
        className="
          pointer-events-none absolute inset-0
          -translate-x-full
          bg-gradient-to-tr from-transparent via-white/60 to-transparent
          rotate-12
          transition-transform duration-200 ease-out
          group-hover:translate-x-[140%]
        "
      />
    </AvatarPrimitive.Root>
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full text-xs font-medium uppercase select-none",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
