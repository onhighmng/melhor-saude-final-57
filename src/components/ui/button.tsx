
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover-lift press-effect shadow-custom-md hover:shadow-custom-lg",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover-lift press-effect shadow-custom-md hover:shadow-custom-lg",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover-glow press-effect shadow-custom-sm hover:shadow-custom-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover-lift press-effect shadow-custom-md hover:shadow-custom-lg",
        ghost: "hover:bg-accent hover:text-accent-foreground hover-glow press-effect",
        link: "text-primary underline-offset-4 hover:underline transition-fast",
        premium: "bg-gradient-to-r from-bright-royal to-vibrant-blue text-white hover:from-bright-royal/90 hover:to-vibrant-blue/90 hover-lift press-effect shadow-custom-lg hover:shadow-custom-xl border border-bright-royal/20",
        hero: "bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm hover-glow press-effect shadow-custom-md hover:shadow-custom-lg",
        success: "bg-emerald-green text-deep-navy hover:bg-emerald-green/90 hover-lift press-effect shadow-custom-md hover:shadow-custom-lg",
        warning: "bg-warm-orange text-white hover:bg-warm-orange/90 hover-lift press-effect shadow-custom-md hover:shadow-custom-lg"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xl: "h-14 rounded-lg px-12 text-base font-semibold"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
