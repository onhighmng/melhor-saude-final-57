import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-full border border-[#4A90E2] bg-white px-8 py-4 text-center font-semibold text-[#4A90E2] transition-all duration-300",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2 transition-colors duration-300 group-hover:text-white">
        <span className="inline-block transition-all duration-300">{text}</span>
        <ArrowRight className="h-5 w-5 transition-all duration-300 group-hover:translate-x-1" />
      </span>
      <div className="absolute left-0 top-0 h-full w-0 bg-[#4A90E2] transition-all duration-300 ease-out group-hover:w-full"></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
