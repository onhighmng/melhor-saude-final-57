import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: React.ReactNode;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", icon, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden rounded-xl border bg-[#4A90E2] p-6 text-center font-semibold text-white",
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-2 translate-x-0 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {icon}
        {text}
      </span>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
        {icon}
        <span>{text}</span>
        <ArrowRight className="h-5 w-5" />
      </div>
      <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-[#3A7BC8] transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-[#3A7BC8]"></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
