import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "quiet"
  | "destructive"
  | "segmented"
  | "mood";
type ButtonSize = "default" | "sm" | "lg" | "compact";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:ring-primary",
  secondary:
    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:ring-secondary",
  outline:
    "border border-input bg-background text-foreground hover:bg-muted/50 focus-visible:ring-ring",
  ghost: "hover:bg-muted/60 text-foreground",
  quiet:
    "bg-transparent text-primary shadow-none hover:bg-primary/10 focus-visible:ring-ring",
  destructive:
    "bg-transparent text-destructive shadow-none hover:bg-destructive/10 focus-visible:ring-destructive",
  segmented:
    "rounded-full bg-transparent text-muted-foreground shadow-none hover:bg-muted focus-visible:ring-ring",
  mood:
    "border border-input bg-transparent text-foreground shadow-none hover:bg-muted/50 focus-visible:ring-ring",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-6 text-base",
  compact: "min-h-8 px-2 py-1 text-xs",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-variant={variant}
        data-size={size}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
