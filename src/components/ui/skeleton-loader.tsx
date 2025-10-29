import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export const SkeletonLoader = ({ className = '', count = 1 }: SkeletonLoaderProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('animate-pulse bg-muted rounded', className)} />
      ))}
    </>
  );
};

