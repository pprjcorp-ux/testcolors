import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold font-display transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 hover:scale-105",
  {
    variants: {
      variant: {
        default: "bg-coral text-white hover:bg-coral-dark focus-visible:ring-coral shadow-md hover:shadow-lg",
        secondary: "bg-teal text-white hover:bg-teal-dark focus-visible:ring-teal shadow-md hover:shadow-lg",
        accent: "bg-sunny text-charcoal hover:bg-sunny-dark focus-visible:ring-sunny shadow-md hover:shadow-lg",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive shadow-md",
        outline: "border-2 border-coral bg-transparent text-coral hover:bg-coral/10 focus-visible:ring-coral",
        ghost: "hover:bg-muted text-charcoal dark:text-white hover:text-coral",
        link: "text-coral underline-offset-4 hover:underline hover:scale-100",
        playful: "bg-gradient-to-r from-coral to-peach text-white hover:from-coral-dark hover:to-coral shadow-playful-coral hover:shadow-lg",
      },
      size: {
        default: "h-10 px-5 py-2",
        xs: "h-7 gap-1 rounded-xl px-3 text-xs",
        sm: "h-9 rounded-xl gap-1.5 px-4",
        lg: "h-12 rounded-2xl px-8 text-base",
        xl: "h-14 rounded-3xl px-10 text-lg",
        icon: "size-10 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
