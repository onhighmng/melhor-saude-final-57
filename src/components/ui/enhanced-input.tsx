import * as React from "react";
import { cn } from "@/lib/utils";

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  loading?: boolean;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, type, error, success, loading, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "input-enhanced",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            success && "border-emerald-green focus:border-emerald-green focus:ring-emerald-green/20",
            loading && "loading-shimmer",
            className
          )}
          ref={ref}
          {...props}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-bright-royal border-t-transparent"></div>
          </div>
        )}
      </div>
    );
  }
);
EnhancedInput.displayName = "EnhancedInput";

export { EnhancedInput };