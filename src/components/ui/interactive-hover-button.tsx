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
      <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-[#4A90E2] transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8]"></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
