import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium select-none whitespace-nowrap border transition-[opacity,transform,background-color,border-color] duration-[var(--motion-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-fg border-transparent hover:opacity-92",
        ghost:
          "bg-transparent text-fg border-border hover:bg-elevated hover:border-border-strong",
        subtle:
          "bg-elevated text-fg border-border hover:border-border-strong",
      },
      size: {
        lg: "h-12 min-h-12 px-6 text-base rounded-[20px]",
        md: "h-11 min-h-11 px-5 text-sm rounded-[16px]",
        sm: "h-9 min-h-9 px-3 text-sm rounded-[12px]",
        icon: "size-11 min-h-11 rounded-[16px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
