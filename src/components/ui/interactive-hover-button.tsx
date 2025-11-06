import React from "react";
import { ArrowRight, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: React.ReactNode;
  inverted?: boolean;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", icon, inverted = false, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-auto cursor-pointer overflow-hidden rounded-full border p-2 text-center font-semibold flex items-center justify-center",
        inverted 
          ? "bg-primary text-primary-foreground border-primary" 
          : "bg-background border",
        className,
      )}
      {...props}
    >
      <span className={cn(
        "inline-block transition-all duration-300 group-hover:translate-x-16 group-hover:opacity-0",
        inverted ? "text-primary-foreground" : ""
      )}>
        {text}
      </span>
      <div className={cn(
        "absolute top-0 z-10 flex h-full w-full translate-x-16 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100",
        inverted ? "text-primary" : "text-primary-foreground"
      )}>
        <span>{text}</span>
        {icon || <ArrowRight />}
      </div>
      <div className={cn(
        "absolute left-[4%] top-[40%] h-2 w-2 scale-[1] rounded-lg transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8]",
        inverted ? "bg-background" : "bg-primary"
      )}></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };