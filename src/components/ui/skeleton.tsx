import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'title' | 'avatar' | 'card'
}

function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const variants = {
    default: "skeleton",
    text: "skeleton-text",
    title: "skeleton-title", 
    avatar: "skeleton rounded-full w-12 h-12",
    card: "skeleton h-32 w-full rounded-lg"
  }

  return (
    <div
      className={cn(variants[variant], className)}
      {...props}
    />
  )
}

// Loading skeleton patterns for common UI elements
const SkeletonCard = () => (
  <div className="bg-card border rounded-lg p-6 space-y-3">
    <Skeleton variant="title" />
    <Skeleton variant="text" />
    <Skeleton variant="text" className="w-2/3" />
    <div className="flex items-center space-x-4 pt-2">
      <Skeleton variant="avatar" className="w-8 h-8" />
      <Skeleton variant="text" className="w-24 h-4" />
    </div>
  </div>
)

const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton variant="avatar" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-3/4" />
        </div>
      </div>
    ))}
  </div>
)

const SkeletonVideo = () => (
  <div className="relative">
    <Skeleton className="w-full aspect-video rounded-lg" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
        <div className="w-0 h-0 border-l-8 border-r-0 border-t-6 border-b-6 border-transparent border-l-white/70 ml-1"></div>
      </div>
    </div>
  </div>
)

export { Skeleton, SkeletonCard, SkeletonList, SkeletonVideo }